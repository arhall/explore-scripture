const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const url =
  process.env.LIGHTHOUSE_BADGE_URL ||
  process.env.LIGHTHOUSE_BASE_URL ||
  'https://explore-scripture.pages.dev';
const outputDir =
  process.env.LIGHTHOUSE_BADGE_OUTPUT || path.join(process.cwd(), 'docs', 'badges');
const badgeStyle = process.env.LIGHTHOUSE_BADGE_STYLE || 'flat';
const singleBadge = process.env.LIGHTHOUSE_BADGE_SINGLE === 'true';
const saveReport = process.env.LIGHTHOUSE_BADGE_SAVE_REPORT === 'true';

fs.mkdirSync(outputDir, { recursive: true });

const localBin = path.join(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'lighthouse-badges.cmd' : 'lighthouse-badges'
);

const buildArgs = () => {
  const args = ['--url', url, '--output-path', outputDir, '--badge-style', badgeStyle];
  if (singleBadge) args.push('--single-badge');
  if (saveReport) args.push('--save-report');
  return args;
};

try {
  if (fs.existsSync(localBin)) {
    execFileSync(localBin, buildArgs(), { stdio: 'inherit' });
  } else {
    const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    execFileSync(npx, ['lighthouse-badges', ...buildArgs()], { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Failed to generate Lighthouse badges.');
  console.error('Install bun (bunx) or add lighthouse-badges as a dev dependency.');
  throw error;
}
