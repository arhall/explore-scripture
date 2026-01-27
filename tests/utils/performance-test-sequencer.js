const path = require('path');
const Sequencer = require('@jest/test-sequencer').default;

class PerformanceTestSequencer extends Sequencer {
  sort(tests) {
    const summaryPath = path.resolve(__dirname, '..', 'performance-summary.test.js');
    return Array.from(tests).sort((a, b) => {
      const aIsSummary = path.resolve(a.path) === summaryPath;
      const bIsSummary = path.resolve(b.path) === summaryPath;
      if (aIsSummary && !bIsSummary) return 1;
      if (!aIsSummary && bIsSummary) return -1;
      return a.path.localeCompare(b.path);
    });
  }
}

module.exports = PerformanceTestSequencer;
