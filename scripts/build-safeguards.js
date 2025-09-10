#!/usr/bin/env node

/**
 * Build Process Safeguards
 *
 * Prevents infinite loops and runaway processes during development builds
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class BuildSafeguards {
  constructor() {
    this.maxBuildTime = 5 * 60 * 1000; // 5 minutes max
    this.maxMemoryUsage = 2 * 1024 * 1024 * 1024; // 2GB max
    this.buildLockFile = './.build-lock';
    this.processTracker = new Map();
  }

  async createBuildLock() {
    const lockData = {
      pid: process.pid,
      startTime: Date.now(),
      command: process.argv.join(' '),
      maxDuration: this.maxBuildTime,
    };

    fs.writeFileSync(this.buildLockFile, JSON.stringify(lockData, null, 2));

    // Auto-cleanup on process exit
    process.on('exit', () => this.removeBuildLock());
    process.on('SIGINT', () => {
      this.removeBuildLock();
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      this.removeBuildLock();
      process.exit(0);
    });
  }

  removeBuildLock() {
    if (fs.existsSync(this.buildLockFile)) {
      fs.unlinkSync(this.buildLockFile);
    }
  }

  checkExistingBuild() {
    if (!fs.existsSync(this.buildLockFile)) {
      return false;
    }

    try {
      const lockData = JSON.parse(fs.readFileSync(this.buildLockFile, 'utf8'));
      const buildAge = Date.now() - lockData.startTime;

      // If build is older than max time, remove stale lock
      if (buildAge > this.maxBuildTime) {
        console.log('🧹 Removing stale build lock (exceeded max duration)');
        this.removeBuildLock();
        return false;
      }

      // Check if the process is still running
      try {
        process.kill(lockData.pid, 0); // Check if process exists
        console.log(`⚠️  Build already in progress (PID: ${lockData.pid})`);
        console.log(`   Started: ${new Date(lockData.startTime).toISOString()}`);
        console.log(`   Duration: ${Math.floor(buildAge / 1000)}s`);
        return true;
      } catch (e) {
        // Process doesn't exist, remove stale lock
        console.log('🧹 Removing stale build lock (process not found)');
        this.removeBuildLock();
        return false;
      }
    } catch (e) {
      // Corrupted lock file, remove it
      this.removeBuildLock();
      return false;
    }
  }

  async runWithTimeout(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      console.log(`🚀 Running: ${command} ${args.join(' ')}`);

      const startTime = Date.now();
      const child = spawn(command, args, {
        stdio: 'inherit',
        ...options,
      });

      // Track the process
      this.processTracker.set(child.pid, {
        command: `${command} ${args.join(' ')}`,
        startTime,
      });

      // Timeout handler
      const timeout = setTimeout(() => {
        console.log(`❌ Build timeout after ${this.maxBuildTime / 1000}s`);
        child.kill('SIGTERM');

        // Force kill after 5 more seconds
        setTimeout(() => {
          child.kill('SIGKILL');
        }, 5000);

        reject(new Error('Build timeout'));
      }, this.maxBuildTime);

      // Memory monitoring
      const memoryCheck = setInterval(() => {
        const memUsage = process.memoryUsage();
        if (memUsage.heapUsed > this.maxMemoryUsage) {
          console.log(`❌ Memory usage exceeded ${this.maxMemoryUsage / 1024 / 1024}MB`);
          child.kill('SIGTERM');
          clearInterval(memoryCheck);
          reject(new Error('Memory usage exceeded'));
        }
      }, 5000);

      child.on('exit', code => {
        clearTimeout(timeout);
        clearInterval(memoryCheck);
        this.processTracker.delete(child.pid);

        const duration = Date.now() - startTime;
        console.log(`✅ Process completed in ${Math.floor(duration / 1000)}s`);

        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });

      child.on('error', error => {
        clearTimeout(timeout);
        clearInterval(memoryCheck);
        this.processTracker.delete(child.pid);
        reject(error);
      });
    });
  }

  async killRunawayProcesses() {
    console.log('🔍 Checking for runaway Node processes...');

    try {
      const { stdout } = await this.runCommand(
        'ps aux | grep -E "(node|eleventy|wrangler)" | grep -v grep',
        []
      );

      const processes = stdout.split('\n').filter(line => line.trim());
      const suspiciousProcesses = [];

      processes.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 11) {
          const cpu = parseFloat(parts[2]);
          const memory = parseFloat(parts[3]);
          const pid = parts[1];

          // Check for high CPU usage (>50%) or high memory (>20%)
          if (cpu > 50 || memory > 20) {
            suspiciousProcesses.push({
              pid,
              cpu,
              memory,
              command: parts.slice(10).join(' '),
            });
          }
        }
      });

      if (suspiciousProcesses.length > 0) {
        console.log('⚠️  Found suspicious processes:');
        suspiciousProcesses.forEach(proc => {
          console.log(`   PID: ${proc.pid}, CPU: ${proc.cpu}%, Memory: ${proc.memory}%`);
          console.log(`   Command: ${proc.command}`);
        });

        // Kill processes that are likely runaway builds
        for (const proc of suspiciousProcesses) {
          if (
            proc.command.includes('eleventy') ||
            proc.command.includes('wrangler') ||
            (proc.command.includes('node') && proc.cpu > 100)
          ) {
            console.log(`🔪 Killing runaway process PID ${proc.pid}`);
            try {
              process.kill(proc.pid, 'SIGTERM');
              // Force kill after 5 seconds
              setTimeout(() => {
                try {
                  process.kill(proc.pid, 'SIGKILL');
                } catch (e) {
                  // Process already dead
                }
              }, 5000);
            } catch (e) {
              console.log(`   Could not kill process ${proc.pid}: ${e.message}`);
            }
          }
        }
      } else {
        console.log('✅ No runaway processes found');
      }
    } catch (error) {
      console.log('⚠️  Could not check for runaway processes:', error.message);
    }
  }

  runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      let child;
      if (args.length === 0) {
        // Command is a shell command string
        child = spawn('sh', ['-c', command]);
      } else {
        // Command with separate args
        child = spawn(command, args);
      }

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', data => {
        stdout += data.toString();
      });

      child.stderr.on('data', data => {
        stderr += data.toString();
      });

      child.on('exit', code => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed: ${stderr}`));
        }
      });
    });
  }

  async preventInfiniteLoop() {
    // Check for build lock
    if (this.checkExistingBuild()) {
      console.log('❌ Build already in progress. Aborting to prevent conflicts.');
      process.exit(1);
    }

    // Kill any runaway processes
    await this.killRunawayProcesses();

    // Create new build lock
    await this.createBuildLock();

    console.log('🛡️  Build safeguards activated');
    console.log(`   Max build time: ${this.maxBuildTime / 1000}s`);
    console.log(`   Max memory: ${this.maxMemoryUsage / 1024 / 1024}MB`);
  }

  async safeDevBuild() {
    await this.preventInfiniteLoop();

    try {
      console.log('🚀 Starting safe development build...');

      // Run entity processing with timeout
      await this.runWithTimeout('npm', ['run', 'entities:dev']);

      // Run search generation with timeout
      await this.runWithTimeout('npm', ['run', 'search:generate']);

      // Run Eleventy build with timeout
      await this.runWithTimeout('npx', ['eleventy', '--config=.eleventy.development.js']);

      console.log('✅ Safe development build completed');
    } catch (error) {
      console.error('❌ Safe build failed:', error.message);
      throw error;
    } finally {
      this.removeBuildLock();
    }
  }

  async safeWorkersDev() {
    await this.preventInfiniteLoop();

    try {
      console.log('🚀 Starting safe Cloudflare Workers dev...');

      // First, do a quick build
      await this.runWithTimeout('npm', ['run', 'build:workers-dev']);

      // Then start wrangler dev - this should run indefinitely
      console.log('🌐 Starting wrangler dev (this will run until you stop it)...');
      await this.runLongRunningProcess('npx', ['wrangler', 'dev', '--local']);
    } catch (error) {
      console.error('❌ Safe workers dev failed:', error.message);
      throw error;
    } finally {
      this.removeBuildLock();
    }
  }

  async runLongRunningProcess(command, args = []) {
    return new Promise((resolve, reject) => {
      console.log(`🚀 Running long-running process: ${command} ${args.join(' ')}`);

      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: false,
      });

      // Set up signal handlers to properly handle Ctrl+C
      process.on('SIGINT', () => {
        console.log('\n🛑 Received interrupt signal, stopping wrangler...');
        child.kill('SIGINT');
        resolve(0); // Treat interrupt as success
      });

      process.on('SIGTERM', () => {
        console.log('\n🛑 Received terminate signal, stopping wrangler...');
        child.kill('SIGTERM');
        resolve(0); // Treat termination as success
      });

      child.on('exit', (code, signal) => {
        if (signal === 'SIGINT' || signal === 'SIGTERM') {
          console.log(`✅ Wrangler stopped gracefully (${signal})`);
          resolve(0);
        } else if (code === 0) {
          console.log('✅ Wrangler completed successfully');
          resolve(code);
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });

      child.on('error', error => {
        reject(error);
      });
    });
  }
}

module.exports = { BuildSafeguards };

// CLI usage
if (require.main === module) {
  const safeguards = new BuildSafeguards();
  const command = process.argv[2];

  (async () => {
    try {
      switch (command) {
        case 'dev':
          await safeguards.safeDevBuild();
          break;
        case 'workers':
          await safeguards.safeWorkersDev();
          break;
        case 'check':
          await safeguards.killRunawayProcesses();
          break;
        case 'cleanup':
          safeguards.removeBuildLock();
          await safeguards.killRunawayProcesses();
          break;
        default:
          console.log('Usage: node scripts/build-safeguards.js [dev|workers|check|cleanup]');
          console.log('  dev     - Safe development build');
          console.log('  workers - Safe Cloudflare Workers dev');
          console.log('  check   - Check for runaway processes');
          console.log('  cleanup - Clean up locks and kill runaway processes');
      }
    } catch (error) {
      console.error('❌ Safeguards failed:', error.message);
      process.exit(1);
    }
  })();
}
