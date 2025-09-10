#!/usr/bin/env node

/**
 * Safe Wrangler Dev
 *
 * Wrapper around wrangler dev that prevents infinite build loops
 * by using a build command that doesn't write to watched directories
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class SafeWranglerDev {
  constructor() {
    this.tempDir = './tmp/wrangler-build';
  }

  async createSafeBuildScript() {
    console.log('🔧 Creating safe build configuration...');

    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    // Create a package.json script that builds to temp location
    const safeBuildScript = `#!/usr/bin/env node

const { spawn } = require('child_process');

async function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { 
            stdio: 'inherit',
            shell: true,
            env: { 
                ...process.env, 
                TEMP_BUILD: 'true',
                OUTPUT_DIR: './tmp/wrangler-build'
            }
        });

        child.on('exit', (code) => {
            if (code === 0) {
                resolve(code);
            } else {
                reject(new Error(\`Command failed with code \${code}\`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function safeBuild() {
    try {
        console.log('🚀 Running safe build for wrangler...');
        
        // Skip entity processing if files exist
        if (!require('fs').existsSync('./src/assets/data/books.json')) {
            await runCommand('npm', ['run', 'entities:dev']);
        }
        
        // Skip search generation if files exist  
        if (!require('fs').existsSync('./src/assets/data/search-data.json')) {
            await runCommand('npm', ['run', 'search:generate']);
        }
        
        // Quick Eleventy build
        await runCommand('npx', ['eleventy', '--config=.eleventy.js', '--quiet']);
        
        console.log('✅ Safe build complete');
        
    } catch (error) {
        console.error('❌ Safe build failed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    safeBuild();
}
`;

    fs.writeFileSync(path.join(this.tempDir, 'safe-build.js'), safeBuildScript);
    console.log('✅ Safe build script created');
  }

  async updateWranglerConfig() {
    console.log('🔧 Creating safe wrangler configuration...');

    // Create a temporary wrangler.toml that uses the safe build
    const safeWranglerConfig = `name = "explore-scripture"
main = "src/worker.js"
compatibility_date = "2024-09-09"
compatibility_flags = ["nodejs_compat"]

# Account settings (using environment variables)
account_id = "\${CLOUDFLARE_ACCOUNT_ID}"

# Environment variables
[vars]
ENVIRONMENT = "production"

# KV Namespaces for caching
[[kv_namespaces]]
binding = "CACHE"
id = "\${CLOUDFLARE_KV_CACHE_ID}"
preview_id = "\${CLOUDFLARE_KV_CACHE_PREVIEW_ID}"

[[kv_namespaces]]
binding = "ENTITIES"
id = "\${CLOUDFLARE_KV_ENTITIES_ID}"
preview_id = "\${CLOUDFLARE_KV_ENTITIES_PREVIEW_ID}"

# Static assets configuration
[site]
bucket = "_site"

# Safe build configuration - uses cached build only
[build]
command = "echo 'Using cached build - no rebuild needed'"
cwd = "./"

# Development settings
[dev]
local_protocol = "https"
port = 8787

# Routes
[[routes]]
pattern = "*bible-explorer.pages.dev/*"
zone_name = "pages.dev"

# Security headers
[env.production]
[env.production.vars]
CSP_HEADER = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; connect-src 'self' https://api.esv.org https://www.biblegateway.com; frame-src https://www.youtube.com https://www.biblegateway.com;"

# Analytics
[[analytics_engine_datasets]]
binding = "BIBLE_ANALYTICS"
dataset = "explore_scripture_analytics"
`;

    fs.writeFileSync('./wrangler.safe.toml', safeWranglerConfig);
    console.log('✅ Safe wrangler config created');
  }

  async runSafeBuild() {
    console.log('🏗️  Running initial safe build...');

    return new Promise((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build:workers-temp'], {
        stdio: 'inherit',
      });

      const timeout = setTimeout(() => {
        buildProcess.kill('SIGTERM');
        reject(new Error('Build timeout'));
      }, 180000); // 3 minute timeout

      buildProcess.on('exit', code => {
        clearTimeout(timeout);
        if (code === 0) {
          console.log('✅ Initial build completed');
          resolve(code);
        } else {
          reject(new Error(`Build failed with code ${code}`));
        }
      });

      buildProcess.on('error', error => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  async startSafeWrangler() {
    console.log('🚀 Starting wrangler with safe configuration...');

    const wranglerProcess = spawn(
      'npx',
      ['wrangler', 'dev', '--config', 'wrangler.safe.toml', '--local'],
      {
        stdio: 'inherit',
      }
    );

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down wrangler...');
      wranglerProcess.kill('SIGINT');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Terminating wrangler...');
      wranglerProcess.kill('SIGTERM');
      process.exit(0);
    });

    wranglerProcess.on('exit', code => {
      console.log(`✅ Wrangler exited with code ${code}`);
      process.exit(code);
    });

    wranglerProcess.on('error', error => {
      console.error('❌ Wrangler error:', error);
      process.exit(1);
    });
  }

  async run() {
    try {
      console.log('🛡️  Starting Safe Wrangler Dev...');

      await this.createSafeBuildScript();
      await this.updateWranglerConfig();
      await this.runSafeBuild();
      await this.startSafeWrangler();
    } catch (error) {
      console.error('❌ Safe Wrangler Dev failed:', error.message);
      process.exit(1);
    }
  }
}

// CLI usage
if (require.main === module) {
  const safeWrangler = new SafeWranglerDev();
  safeWrangler.run();
}

module.exports = { SafeWranglerDev };
