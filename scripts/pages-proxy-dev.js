#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function getBin(name) {
  if (process.platform === 'win32') {
    return `${name}.cmd`;
  }

  return name;
}

class PagesProxyDev {
  constructor() {
    this.children = [];
    this.stopping = false;
    this.pagesPort = process.env.PAGES_DEV_PORT || '8788';
    this.inspectorPort = process.env.PAGES_DEV_INSPECTOR_PORT || '9231';
    this.wranglerHome = path.resolve(process.cwd(), 'tmp/wrangler-home');
    this.wranglerLogsDir = path.join(this.wranglerHome, '.wrangler', 'logs');
    this.wranglerStateDir = path.resolve(process.cwd(), '.wrangler/state/pages-dev');
  }

  ensureDirectories() {
    [this.wranglerHome, this.wranglerLogsDir, this.wranglerStateDir].forEach(dir => {
      fs.mkdirSync(dir, { recursive: true });
    });
  }

  async runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: false,
        ...options,
      });

      child.on('exit', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  spawnManaged(name, command, args, options = {}) {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options,
    });

    this.children.push({ name, child });

    child.on('exit', code => {
      if (this.stopping) {
        return;
      }

      this.stopAll(code ?? 1);
    });

    child.on('error', error => {
      if (this.stopping) {
        return;
      }

      console.error(`[PagesProxyDev] ${name} failed:`, error.message);
      this.stopAll(1);
    });

    return child;
  }

  stopAll(exitCode = 0) {
    if (this.stopping) {
      return;
    }

    this.stopping = true;

    for (const { child } of this.children) {
      if (!child.killed) {
        child.kill('SIGINT');
      }
    }

    setTimeout(() => {
      for (const { child } of this.children) {
        if (!child.killed) {
          child.kill('SIGTERM');
        }
      }
    }, 1500);

    setTimeout(() => {
      process.exit(exitCode);
    }, 2000);
  }

  getWranglerEnv() {
    return {
      ...process.env,
      HOME: this.wranglerHome,
      XDG_CONFIG_HOME: this.wranglerHome,
      XDG_CACHE_HOME: path.join(this.wranglerHome, '.cache'),
    };
  }

  async run() {
    this.ensureDirectories();

    process.on('SIGINT', () => this.stopAll(0));
    process.on('SIGTERM', () => this.stopAll(0));

    console.log('[PagesProxyDev] Preparing local data...');
    await this.runCommand(getBin('npm'), ['run', 'entities:dev']);
    await this.runCommand(getBin('npm'), ['run', 'search:generate']);

    console.log('[PagesProxyDev] Building initial Eleventy output...');
    await this.runCommand(getBin('npx'), ['eleventy', '--config=.eleventy.development.js']);

    console.log('[PagesProxyDev] Starting Eleventy watcher...');
    this.spawnManaged('eleventy-watch', getBin('npx'), [
      'eleventy',
      '--config=.eleventy.development.js',
      '--watch',
    ]);

    const wranglerArgs = [
      'wrangler',
      'pages',
      'dev',
      '_site',
      '--compatibility-date',
      '2024-09-09',
      '--compatibility-flag',
      'nodejs_compat',
      '--ip',
      '127.0.0.1',
      '--port',
      this.pagesPort,
      '--inspector-port',
      this.inspectorPort,
      '--persist-to',
      this.wranglerStateDir,
      '--local-protocol',
      'http',
      '--show-interactive-dev-session=false',
      '--log-level',
      'warn',
    ];

    if (fs.existsSync(path.resolve(process.cwd(), '.env'))) {
      wranglerArgs.push('--env-file', '.env');
    }

    console.log(`[PagesProxyDev] Starting Cloudflare Pages dev at http://127.0.0.1:${this.pagesPort}`);
    this.spawnManaged('pages-dev', getBin('npx'), wranglerArgs, {
      env: this.getWranglerEnv(),
    });
  }
}

if (require.main === module) {
  const devServer = new PagesProxyDev();
  devServer.run().catch(error => {
    console.error('[PagesProxyDev] Startup failed:', error.message);
    process.exit(1);
  });
}
