const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { execSync } = require('child_process');

const CFT_JSON_URL =
  'https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json';

const getPlatform = () => {
  const platform = os.platform();
  const arch = os.arch();
  if (platform === 'darwin') {
    return arch === 'arm64' ? 'mac-arm64' : 'mac-x64';
  }
  if (platform === 'win32') {
    return arch === 'ia32' ? 'win32' : 'win64';
  }
  return 'linux64';
};

const fetchJson = url =>
  new Promise((resolve, reject) => {
    https
      .get(url, res => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchJson(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
          return;
        }
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', reject);
  });

const downloadFile = (url, dest) =>
  new Promise((resolve, reject) => {
    https
      .get(url, res => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadFile(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
          return;
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', error => {
          fs.unlinkSync(dest);
          reject(error);
        });
      })
      .on('error', reject);
  });

const extractZip = (zipPath, destDir) => {
  if (process.platform === 'win32') {
    const psCommand = `Expand-Archive -Path "${zipPath}" -DestinationPath "${destDir}" -Force`;
    execSync(`powershell -Command "${psCommand}"`, { stdio: 'ignore' });
    return;
  }
  execSync(`unzip -q "${zipPath}" -d "${destDir}"`, { stdio: 'ignore' });
};

const resolveExecutablePath = (rootDir, platform) => {
  const baseDir = path.join(rootDir, `chrome-${platform}`);
  if (platform === 'linux64') {
    return path.join(baseDir, 'chrome');
  }
  if (platform === 'win32' || platform === 'win64') {
    return path.join(baseDir, 'chrome.exe');
  }
  return path.join(
    baseDir,
    'Google Chrome for Testing.app',
    'Contents',
    'MacOS',
    'Google Chrome for Testing'
  );
};

const cleanupOldVersions = (rootDir, log, keepVersions = 1) => {
  if (!fs.existsSync(rootDir)) return;
  const entries = fs
    .readdirSync(rootDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => /^\d+\.\d+\.\d+\.\d+$/.test(name))
    .sort((a, b) => {
      const aParts = a.split('.').map(Number);
      const bParts = b.split('.').map(Number);
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i += 1) {
        const diff = (bParts[i] || 0) - (aParts[i] || 0);
        if (diff !== 0) return diff;
      }
      return 0;
    });

  const toRemove = entries.slice(keepVersions);
  toRemove.forEach(dir => {
    const fullPath = path.join(rootDir, dir);
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      if (log) {
        log(`Removed outdated Chrome for Testing version: ${dir}`);
      }
    } catch (error) {
      if (log) {
        log(`Failed to remove outdated Chrome for Testing version ${dir}: ${error.message}`);
      }
    }
  });
};

const ensureChromeForTesting = async ({ cacheDir, log } = {}) => {
  const platform = getPlatform();
  const rootDir = cacheDir || path.join(process.cwd(), '.chrome-for-testing');

  const json = await fetchJson(CFT_JSON_URL);
  const stable = json.channels?.Stable;
  if (!stable || !stable.version || !stable.downloads?.chrome) {
    throw new Error('Invalid Chrome for Testing manifest data.');
  }

  const downloadInfo = stable.downloads.chrome.find(entry => entry.platform === platform);
  if (!downloadInfo) {
    throw new Error(`No Chrome for Testing download for platform ${platform}`);
  }

  const version = stable.version;
  const versionDir = path.join(rootDir, version, platform);
  const zipPath = path.join(versionDir, `chrome-${platform}.zip`);
  const executablePath = resolveExecutablePath(versionDir, platform);

  if (fs.existsSync(executablePath)) {
    cleanupOldVersions(rootDir, log);
    return { executablePath, version, platform, source: 'cache' };
  }

  fs.mkdirSync(versionDir, { recursive: true });

  if (log) {
    log(`Downloading Chrome for Testing ${version} (${platform}) from ${downloadInfo.url}`);
  }

  if (!fs.existsSync(zipPath)) {
    await downloadFile(downloadInfo.url, zipPath);
  }

  extractZip(zipPath, versionDir);

  if (!fs.existsSync(executablePath)) {
    throw new Error(`Chrome for Testing executable not found at ${executablePath}`);
  }

  if (process.platform !== 'win32') {
    try {
      fs.chmodSync(executablePath, 0o755);
    } catch (error) {
      // Ignore chmod errors.
    }
  }

  if (log && process.platform === 'darwin') {
    log(
      `macOS quarantine may block this binary. If launch fails, run: xattr -d com.apple.quarantine "${executablePath}"`
    );
  }

  cleanupOldVersions(rootDir, log);
  return { executablePath, version, platform, source: 'download' };
};

module.exports = {
  ensureChromeForTesting,
};
