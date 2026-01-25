const fs = require('fs');
const path = require('path');

const summaryDir = path.join(process.cwd(), 'tests', 'reports', 'performance-summary');
const summaryPath = path.join(summaryDir, `summary-${process.pid}.json`);

const ensureDir = () => {
  fs.mkdirSync(summaryDir, { recursive: true });
};

const readSummary = filePath => {
  const target = filePath || summaryPath;
  try {
    return JSON.parse(fs.readFileSync(target, 'utf8'));
  } catch (error) {
    return { startedAt: new Date().toISOString() };
  }
};

const writeSummary = (summary, filePath) => {
  ensureDir();
  const target = filePath || summaryPath;
  fs.writeFileSync(target, JSON.stringify(summary, null, 2));
};

const updateSummary = updater => {
  const summary = readSummary();
  updater(summary);
  writeSummary(summary);
  return summary;
};

const listSummaryFiles = () => {
  if (!fs.existsSync(summaryDir)) return [];
  return fs
    .readdirSync(summaryDir)
    .filter(file => file.startsWith('summary-') && file.endsWith('.json'))
    .map(file => path.join(summaryDir, file));
};

const mergeSummaryInto = (target, source) => {
  if (!source) return;
  Object.entries(source).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      const existing = Array.isArray(target[key]) ? target[key] : [];
      target[key] = Array.from(new Set([...existing, ...value]));
      return;
    }
    if (typeof value === 'object') {
      if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
        target[key] = {};
      }
      mergeSummaryInto(target[key], value);
      return;
    }
    if (target[key] === undefined) {
      target[key] = value;
    }
  });
};

const mergeSummaries = summaries => {
  const merged = {};
  summaries.forEach(summary => mergeSummaryInto(merged, summary));
  return merged;
};

module.exports = {
  summaryDir,
  summaryPath,
  readSummary,
  writeSummary,
  updateSummary,
  listSummaryFiles,
  mergeSummaries,
};
