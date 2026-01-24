const { execSync } = require('child_process');

const getCommitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD', {
      stdio: ['ignore', 'pipe', 'ignore']
    })
      .toString()
      .trim();
  } catch (error) {
    return 'unknown';
  }
};

const getEstTimestamp = () => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    }).format(new Date());
  } catch (error) {
    return new Date().toISOString();
  }
};

module.exports = {
  commitHash: getCommitHash(),
  lastUpdated: getEstTimestamp()
};
