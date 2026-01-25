#!/usr/bin/env node

/**
 * Character Profile Sync
 * Maps NT/OT character profiles to entity records, creates missing entities,
 * and generates profile HTML artifacts + mapping index for the UI.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const PROFILE_DIRS = [
  { dir: path.join(ROOT_DIR, 'NTCharacters'), testament: 'NT' },
  { dir: path.join(ROOT_DIR, 'OTCharacters'), testament: 'OT' },
];

const ENTITIES_DIR = path.join(ROOT_DIR, 'src', 'assets', 'data', 'entities');
const PROFILE_OUTPUT_DIR = path.join(ROOT_DIR, 'src', 'assets', 'data', 'character-profiles');
const PROFILE_INDEX_FILE = path.join(PROFILE_OUTPUT_DIR, 'index.json');
const ENTITY_IDS_FILE = path.join(ROOT_DIR, 'src', '_data', 'entityIds.js');
const ENTITY_SEARCH_FILE = path.join(ROOT_DIR, 'src', 'assets', 'data', 'entities-search.json');
const MASTER_DATASET_FILE = path.join(
  ROOT_DIR,
  'data',
  'source-datasets',
  'Bible_combined_all_expanded.with_ids.v2.json'
);
const BOOKS_FILE = path.join(ROOT_DIR, 'src', '_data', 'books.json');

const PERSON_TYPES = new Set(['person']);
const ANTAGONIST_MARKER = `${path.sep}Antagonists${path.sep}`;
const NON_NAME_TOKENS = new Set([
  'prophecy',
  'prophesy',
  'prophet',
  'speech',
  'sermon',
  'vision',
  'sign',
  'confession',
  'restoration',
  'denial',
  'testimony',
  'defense',
  'greeting',
  'letter',
  'warning',
  'imprisonment',
  'arrest',
  'trial',
  'death',
  'martyrdom',
  'healing',
  'miracle',
  'miracles',
  'baptism',
  'jailbreak',
  'conversion',
  'temptation',
  'betrayal',
  'visionary',
  'message',
  'oracle',
  'lament',
  'judgment',
  'plague',
  'banquet',
  'dream',
  'signs',
  'deliverance',
  'predicts',
  'prediction',
  'famine',
]);

const NAME_CONNECTORS = new Set([
  'of',
  'son',
  'daughter',
  'wife',
  'mother',
  'father',
  'brother',
  'sister',
  'king',
  'queen',
  'apostle',
  'prophet',
  'the',
  'ben',
  'bar',
]);

const SKIP_PROFILE_PREFIXES = ['List-'];
const NAME_ALIASES = {
  mathew: 'matthew',
  habbakuk: 'habakkuk',
};

const BOOK_ABBREVIATIONS = {
  Gen: 'Genesis',
  Genesis: 'Genesis',
  Exod: 'Exodus',
  Exodus: 'Exodus',
  Ex: 'Exodus',
  Lev: 'Leviticus',
  Leviticus: 'Leviticus',
  Num: 'Numbers',
  Numbers: 'Numbers',
  Deut: 'Deuteronomy',
  Deuteronomy: 'Deuteronomy',
  Dt: 'Deuteronomy',
  Josh: 'Joshua',
  Joshua: 'Joshua',
  Judg: 'Judges',
  Judges: 'Judges',
  Ruth: 'Ruth',
  '1 Sam': '1 Samuel',
  '1Samuel': '1 Samuel',
  '1 Samuel': '1 Samuel',
  '2 Sam': '2 Samuel',
  '2Samuel': '2 Samuel',
  '2 Samuel': '2 Samuel',
  '1 Kgs': '1 Kings',
  '1Kings': '1 Kings',
  '1 Kings': '1 Kings',
  '2 Kgs': '2 Kings',
  '2Kings': '2 Kings',
  '2 Kings': '2 Kings',
  '1 Chr': '1 Chronicles',
  '1Chronicles': '1 Chronicles',
  '1 Chronicles': '1 Chronicles',
  '2 Chr': '2 Chronicles',
  '2Chronicles': '2 Chronicles',
  '2 Chronicles': '2 Chronicles',
  Ezra: 'Ezra',
  Neh: 'Nehemiah',
  Nehemiah: 'Nehemiah',
  Esth: 'Esther',
  Esther: 'Esther',
  Job: 'Job',
  Ps: 'Psalms',
  Psalm: 'Psalms',
  Psalms: 'Psalms',
  Prov: 'Proverbs',
  Proverbs: 'Proverbs',
  Eccl: 'Ecclesiastes',
  Ecclesiastes: 'Ecclesiastes',
  Song: 'Song of Songs',
  'Song of Songs': 'Song of Songs',
  Isa: 'Isaiah',
  Isaiah: 'Isaiah',
  Jer: 'Jeremiah',
  Jeremiah: 'Jeremiah',
  Lam: 'Lamentations',
  Lamentations: 'Lamentations',
  Ezek: 'Ezekiel',
  Ezekiel: 'Ezekiel',
  Dan: 'Daniel',
  Daniel: 'Daniel',
  Hos: 'Hosea',
  Hosea: 'Hosea',
  Joel: 'Joel',
  Amos: 'Amos',
  Obad: 'Obadiah',
  Obadiah: 'Obadiah',
  Jonah: 'Jonah',
  Mic: 'Micah',
  Micah: 'Micah',
  Nah: 'Nahum',
  Nahum: 'Nahum',
  Hab: 'Habakkuk',
  Habakkuk: 'Habakkuk',
  Zeph: 'Zephaniah',
  Zephaniah: 'Zephaniah',
  Hag: 'Haggai',
  Haggai: 'Haggai',
  Zech: 'Zechariah',
  Zechariah: 'Zechariah',
  Mal: 'Malachi',
  Malachi: 'Malachi',
  Matt: 'Matthew',
  Matthew: 'Matthew',
  Mt: 'Matthew',
  Mark: 'Mark',
  Mk: 'Mark',
  Luke: 'Luke',
  Lk: 'Luke',
  John: 'John',
  Jn: 'John',
  Acts: 'Acts',
  Rom: 'Romans',
  Romans: 'Romans',
  '1 Cor': '1 Corinthians',
  '1Cor': '1 Corinthians',
  '1 Corinthians': '1 Corinthians',
  '2 Cor': '2 Corinthians',
  '2Cor': '2 Corinthians',
  '2 Corinthians': '2 Corinthians',
  Gal: 'Galatians',
  Galatians: 'Galatians',
  Eph: 'Ephesians',
  Ephesians: 'Ephesians',
  Phil: 'Philippians',
  Philippians: 'Philippians',
  Col: 'Colossians',
  Colossians: 'Colossians',
  '1 Thess': '1 Thessalonians',
  '1Thess': '1 Thessalonians',
  '1 Thessalonians': '1 Thessalonians',
  '2 Thess': '2 Thessalonians',
  '2Thess': '2 Thessalonians',
  '2 Thessalonians': '2 Thessalonians',
  '1 Tim': '1 Timothy',
  '1Tim': '1 Timothy',
  '1 Timothy': '1 Timothy',
  '2 Tim': '2 Timothy',
  '2Tim': '2 Timothy',
  '2 Timothy': '2 Timothy',
  Titus: 'Titus',
  Phlm: 'Philemon',
  Philem: 'Philemon',
  Philemon: 'Philemon',
  Heb: 'Hebrews',
  Hebrews: 'Hebrews',
  Jas: 'James',
  James: 'James',
  '1 Pet': '1 Peter',
  '1Pet': '1 Peter',
  '1 Peter': '1 Peter',
  '2 Pet': '2 Peter',
  '2Pet': '2 Peter',
  '2 Peter': '2 Peter',
  '1 John': '1 John',
  '1Jn': '1 John',
  '2 John': '2 John',
  '2Jn': '2 John',
  '3 John': '3 John',
  '3Jn': '3 John',
  Jude: 'Jude',
  Rev: 'Revelation',
  Revelation: 'Revelation',
};

function normalizeReferenceText(text) {
  return text
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildBookAbbreviations() {
  const map = { ...BOOK_ABBREVIATIONS };

  if (fs.existsSync(BOOKS_FILE)) {
    const books = JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf8'));
    books.forEach(book => {
      map[book.name] = book.name;
    });
  }

  return map;
}

function buildBookPatterns(bookMap) {
  const keys = Object.keys(bookMap);
  const patterns = keys
    .sort((a, b) => b.length - a.length)
    .map(key => escapeRegex(key).replace(/\s+/g, '\\s+'));
  return patterns.join('|');
}

function extractBookReferencesFromText(text, bookMap) {
  const bookChapters = new Map();
  const normalizedText = normalizeReferenceText(text);
  const bookPattern = buildBookPatterns(bookMap);

  if (!bookPattern) {
    return {};
  }

  const patterns = [
    new RegExp(`\\b(${bookPattern})\\s+(\\d+):\\d+`, 'gi'),
    new RegExp(`\\b(${bookPattern})\\s+(\\d+)\\s*-\\s*(\\d+)`, 'gi'),
    new RegExp(`\\b(${bookPattern})\\s+(\\d+)`, 'gi'),
  ];

  const addChapter = (bookName, chapter) => {
    if (!bookChapters.has(bookName)) {
      bookChapters.set(bookName, new Set());
    }
    bookChapters.get(bookName).add(chapter);
  };

  patterns.forEach((pattern, index) => {
    let match;
    while ((match = pattern.exec(normalizedText)) !== null) {
      const rawBookName = match[1].replace(/\s+/g, ' ').trim();
      const startChapter = parseInt(match[2], 10);
      const endChapter = match[3] ? parseInt(match[3], 10) : startChapter;
      const bookName = bookMap[rawBookName] || rawBookName;

      if (!startChapter || Number.isNaN(startChapter)) continue;

      if (index === 1 && endChapter && endChapter >= startChapter) {
        for (let chapter = startChapter; chapter <= endChapter; chapter += 1) {
          addChapter(bookName, chapter);
        }
      } else {
        addChapter(bookName, startChapter);
      }
    }
  });

  const result = {};
  bookChapters.forEach((chapters, book) => {
    result[book] = Array.from(chapters).sort((a, b) => a - b);
  });

  return result;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function walkDirectory(dirPath) {
  const results = [];
  if (!fs.existsSync(dirPath)) {
    return results;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDirectory(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  });

  return results;
}

function stripFrontMatter(content) {
  if (!content.startsWith('---')) {
    return { frontMatter: '', body: content };
  }

  const lines = content.split('\n');
  let endIndex = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '---') {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return { frontMatter: '', body: content };
  }

  return {
    frontMatter: lines.slice(1, endIndex).join('\n'),
    body: lines.slice(endIndex + 1).join('\n'),
  };
}

function stripHtml(text) {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractProfileName(html, fallbackName) {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (match && match[1]) {
    const cleaned = stripHtml(match[1]);
    if (cleaned) return cleaned;
  }
  return fallbackName;
}

function cleanProfileHtml(html, profileName) {
  let cleaned = html.replace(/<!--\s*notesbridge:apple-html\s*-->/gi, '').trim();

  if (profileName) {
    const escaped = profileName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const headingPatterns = [
      new RegExp(`<div>\\s*<h1>\\s*${escaped}\\s*<\\/h1>\\s*<\\/div>\\s*`, 'i'),
      new RegExp(`<h1>\\s*${escaped}\\s*<\\/h1>\\s*`, 'i'),
    ];
    headingPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
  }

  cleaned = cleaned.replace(
    /<div>\s*<b>\s*<h1>[^<]*Bible Character Study[^<]*<\/h1>\s*<\/b>\s*<\/div>/i,
    ''
  );

  cleaned = cleaned.replace(/^\s*(<div><br><\/div>\s*)+/, '').trim();
  return cleaned;
}

function normalizeName(value) {
  if (!value) return '';
  return value
    .replace(/’/g, "'")
    .replace(/[“”]/g, '"')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueList(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

function buildCandidateNames(primaryName, fallbackName) {
  const base = primaryName || fallbackName;
  if (!base) return [];

  const candidates = [base];
  candidates.push(base.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim());

  if (base.includes(',')) {
    candidates.push(base.split(',')[0].trim());
    candidates.push(base.replace(/,/g, ' ').replace(/\s+/g, ' ').trim());
  }

  const normalizedBase = normalizeName(base);
  if (NAME_ALIASES[normalizedBase]) {
    candidates.push(NAME_ALIASES[normalizedBase]);
  }

  return uniqueList(candidates);
}

function levenshtein(a, b) {
  if (a === b) return 0;
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[a.length][b.length];
}

function similarityScore(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (!maxLen) return 0;
  const distance = levenshtein(a, b);
  return (maxLen - distance) / maxLen;
}

function scoreNameMatch(candidate, target) {
  if (!candidate || !target) return { score: 0, strategy: 'none' };

  if (candidate === target) {
    return { score: 10, strategy: 'exact' };
  }

  if (target.includes(candidate) || candidate.includes(target)) {
    return { score: 6, strategy: 'contains' };
  }

  const candidateTokens = new Set(candidate.split(' ').filter(Boolean));
  const targetTokens = new Set(target.split(' ').filter(Boolean));
  let overlap = 0;
  candidateTokens.forEach(token => {
    if (targetTokens.has(token)) overlap += 1;
  });

  if (overlap > 0) {
    return { score: overlap * 2, strategy: 'token' };
  }

  const similarity = similarityScore(candidate, target);
  if (similarity >= 0.88) {
    return { score: 4 + similarity * 2, strategy: 'fuzzy' };
  }

  return { score: 0, strategy: 'none' };
}

function scoreEntityMatch(candidateNames, entity) {
  const normalizedCandidates = candidateNames.map(normalizeName).filter(Boolean);
  const candidateTokenCount = Math.max(
    0,
    ...normalizedCandidates.map(candidate => candidate.split(' ').filter(Boolean).length)
  );
  const entityNames = [
    { value: entity.name, source: 'name' },
    ...(entity.aliases || []).map(alias => ({ value: alias, source: 'alias' })),
  ];

  let best = { score: 0, strategy: 'none', source: 'name', normalizedEntityName: '' };

  normalizedCandidates.forEach(candidate => {
    entityNames.forEach(({ value, source }) => {
      const normalizedEntityName = normalizeName(value);
      if (!normalizedEntityName) return;
      const result = scoreNameMatch(candidate, normalizedEntityName);
      if (result.score > best.score) {
        best = {
          score: result.score,
          strategy: result.strategy,
          source,
          normalizedEntityName,
        };
      }
    });
  });

  if (best.score === 0) return null;

  const typeBonus = entity.type === 'person' ? 5 : 0;
  const referenceBoost = Math.min(entity.referencesCount || 0, 50) / 10;
  const candidateTokens = new Set(normalizedCandidates.join(' ').split(' ').filter(Boolean));
  const entityTokens = best.normalizedEntityName.split(' ').filter(Boolean);
  const extraTokens = entityTokens.filter(token => !candidateTokens.has(token));
  const nonNamePenalty = extraTokens.reduce((sum, token) => {
    if (NAME_CONNECTORS.has(token)) return sum;
    return sum + (NON_NAME_TOKENS.has(token) ? 3 : 0.5);
  }, 0);
  const hasConnector = entityTokens.some(token => NAME_CONNECTORS.has(token));
  const extraTokenPenalty =
    candidateTokenCount <= 1 && entityTokens.length > 2 && !hasConnector
      ? (entityTokens.length - 2) * 3
      : 0;

  return {
    score: best.score + typeBonus + referenceBoost - nonNamePenalty - extraTokenPenalty,
    strategy: best.strategy,
    source: best.source,
  };
}

function findBestEntityMatch(candidateNames, entities) {
  const primaryEntities = entities.filter(entity => !entity.profileGenerated);
  const generatedEntities = entities.filter(entity => entity.profileGenerated);

  const attemptMatch = entityList => {
    let bestMatch = null;

    entityList.forEach(entity => {
      if (!PERSON_TYPES.has(entity.type)) return;

      const result = scoreEntityMatch(candidateNames, entity);
      if (!result) return;

      if (!bestMatch || result.score > bestMatch.score) {
        bestMatch = {
          entity,
          score: result.score,
          matchStrategy: result.strategy,
          matchSource: result.source,
        };
      }
    });

    if (!bestMatch || bestMatch.score < 9) {
      return null;
    }

    return bestMatch;
  };

  const primaryMatch = attemptMatch(primaryEntities);
  if (primaryMatch) return primaryMatch;

  return attemptMatch(generatedEntities);
}

function slugify(value) {
  return normalizeName(value).replace(/\s+/g, '-');
}

function generateEntityId(name, existingIds) {
  const slug = slugify(name);
  let hash = crypto.createHash('sha1').update(name).digest('hex').slice(0, 8);
  let candidate = `p.${slug}--${hash}`;

  let counter = 1;
  while (existingIds.has(candidate)) {
    hash = crypto
      .createHash('sha1')
      .update(`${name}-${counter}`)
      .digest('hex')
      .slice(0, 8);
    candidate = `p.${slug}--${hash}`;
    counter += 1;
  }

  return candidate;
}

function summarizeText(text, maxLength = 180) {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;

  const periodIndex = cleaned.indexOf('.', 80);
  if (periodIndex !== -1 && periodIndex < maxLength + 40) {
    return cleaned.slice(0, periodIndex + 1);
  }

  return `${cleaned.slice(0, maxLength).trim()}...`;
}

function loadEntities() {
  if (!fs.existsSync(ENTITIES_DIR)) {
    throw new Error(`Entities directory not found: ${ENTITIES_DIR}`);
  }

  const baseEntityIds = new Set();
  if (fs.existsSync(MASTER_DATASET_FILE)) {
    const masterData = JSON.parse(fs.readFileSync(MASTER_DATASET_FILE, 'utf8'));
    if (Array.isArray(masterData.entries)) {
      masterData.entries.forEach(entry => {
        if (entry && entry.id) {
          baseEntityIds.add(entry.id);
        }
      });
    }
  } else {
    console.warn(`WARN  Master dataset missing at ${MASTER_DATASET_FILE}, treating all entities as base.`);
  }

  const entityFiles = fs.readdirSync(ENTITIES_DIR).filter(file => file.endsWith('.json'));
  const entities = entityFiles.map(file => {
    const fullPath = path.join(ENTITIES_DIR, file);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      category: data.category,
      referencesCount: (data.references || []).length,
      aliases: uniqueList([...(data.aka || []), ...(data.canonicalized_from || [])]),
      profileGenerated: baseEntityIds.size > 0 ? !baseEntityIds.has(data.id) : false,
    };
  });

  return { entities, baseEntityIds };
}

function updateEntityIds(entityIdsToAdd) {
  if (!fs.existsSync(ENTITY_IDS_FILE)) {
    console.warn(`WARN  entityIds.js not found at ${ENTITY_IDS_FILE}, skipping update.`);
    return;
  }

  const currentEntityIds = new Set(
    fs
      .readdirSync(ENTITIES_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
  );

  const existingIds = require(ENTITY_IDS_FILE);

  const filteredExisting = existingIds.filter(id => currentEntityIds.has(id));
  const filteredSet = new Set(filteredExisting);

  const toAdd = entityIdsToAdd.filter(id => !filteredSet.has(id));
  const missingIds = Array.from(currentEntityIds).filter(id => !filteredSet.has(id));
  const appended = [...toAdd, ...missingIds.filter(id => !toAdd.includes(id))];

  if (filteredExisting.length === existingIds.length && appended.length === 0) {
    return;
  }

  const updatedIds = filteredExisting.concat(appended);
  const content = `\n// Auto-generated entity IDs for pagination\n// Updated: ${new Date().toISOString()}\n\nmodule.exports = ${JSON.stringify(updatedIds, null, 2)};\n`;

  fs.writeFileSync(ENTITY_IDS_FILE, content);
}

function updateEntitySearchIndex(newEntities) {
  if (!fs.existsSync(ENTITY_SEARCH_FILE)) {
    console.warn(`WARN  entities-search.json not found at ${ENTITY_SEARCH_FILE}, skipping update.`);
    return;
  }

  const currentEntityIds = new Set(
    fs
      .readdirSync(ENTITIES_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
  );

  const existingData = JSON.parse(fs.readFileSync(ENTITY_SEARCH_FILE, 'utf8'));
  const existingMap = new Map(
    existingData.filter(entry => currentEntityIds.has(entry.id)).map(entry => [entry.id, entry])
  );

  newEntities.forEach(entity => {
    if (existingMap.has(entity.id)) return;

    const entry = {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      url: `/entities/${entity.id}/`,
      blurb: entity.blurb || '',
      searchText: [entity.name, entity.type, entity.category || '', entity.blurb || '']
        .join(' ')
        .toLowerCase(),
      references: (entity.references || []).length,
      books: Object.keys(entity.book_references || {}),
      category: entity.category || 'unknown',
    };

    existingMap.set(entity.id, entry);
  });

  const updated = Array.from(existingMap.values());
  updated.sort((a, b) => b.references - a.references);

  fs.writeFileSync(ENTITY_SEARCH_FILE, JSON.stringify(updated, null, 2));
}

function cleanupGeneratedEntities(baseEntityIds, keepEntityIds) {
  if (!fs.existsSync(ENTITIES_DIR)) return;

  const entityFiles = fs.readdirSync(ENTITIES_DIR).filter(file => file.endsWith('.json'));
  entityFiles.forEach(file => {
    const entityId = file.replace('.json', '');
    if (!baseEntityIds.has(entityId) && !keepEntityIds.has(entityId)) {
      fs.unlinkSync(path.join(ENTITIES_DIR, file));
    }
  });
}

function ensureProfileGeneratedFlag(entityId) {
  const entityPath = path.join(ENTITIES_DIR, `${entityId}.json`);
  if (!fs.existsSync(entityPath)) return;

  const data = JSON.parse(fs.readFileSync(entityPath, 'utf8'));
  if (data.profile_generated) return;

  data.profile_generated = true;
  fs.writeFileSync(entityPath, JSON.stringify(data));
}

async function syncCharacterProfiles() {
  console.log(' Syncing character profiles...');

  ensureDir(PROFILE_OUTPUT_DIR);

  const bookMap = buildBookAbbreviations();

  const profileFiles = PROFILE_DIRS.flatMap(profileDir => {
    const files = walkDirectory(profileDir.dir);
    return files.map(filePath => ({
      filePath,
      testament: profileDir.testament,
    }));
  });

  if (profileFiles.length === 0) {
    console.warn('WARN  No character profile files found.');
    return;
  }

  const { entities, baseEntityIds } = loadEntities();
  const existingEntityIds = new Set(entities.map(entity => entity.id));

  const profileMappings = [];
  const newEntities = [];
  const newEntityIds = [];

  profileFiles.forEach(({ filePath, testament }) => {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { body } = stripFrontMatter(raw);

    const fallbackName = path.basename(filePath, '.md');
    if (SKIP_PROFILE_PREFIXES.some(prefix => fallbackName.startsWith(prefix))) {
      return;
    }
    const profileName = extractProfileName(body, fallbackName);
    const cleanedHtml = cleanProfileHtml(body, profileName);
    const textContent = stripHtml(cleanedHtml);
    const profileBookReferences = extractBookReferencesFromText(textContent, bookMap);
    const profileSummary = summarizeText(textContent);

    const candidateNames = buildCandidateNames(profileName, fallbackName);
    const match = findBestEntityMatch(candidateNames, entities);

    let entityId = match?.entity?.id;
    const entityName = match?.entity?.name || profileName;
    const entityType = match?.entity?.type || 'person';
    let status = match?.entity?.profileGenerated ? 'created' : 'matched';
    let matchStrategy = match?.matchStrategy || 'created';
    let matchSource = match?.matchSource || 'name';
    let matchScore = match?.score || 0;

    if (match?.entity?.profileGenerated) {
      ensureProfileGeneratedFlag(entityId);
    }

    if (!match) {
      entityId = generateEntityId(entityName, existingEntityIds);
      existingEntityIds.add(entityId);
      status = 'created';
      matchStrategy = 'created';
      matchSource = 'profile';
      matchScore = 0;

      const category = filePath.includes(ANTAGONIST_MARKER) ? 'opponent' : 'narrative';

      const newEntity = {
        id: entityId,
        name: entityName,
        type: 'person',
        category,
        blurb: summarizeText(textContent),
        references: [],
        cross_references: [],
        book_references: {},
        source_testaments: [testament],
        canonicalized_from: [],
        profile_generated: true,
      };

      newEntities.push(newEntity);
      newEntityIds.push(entityId);

      const entityPath = path.join(ENTITIES_DIR, `${entityId}.json`);
      fs.writeFileSync(entityPath, JSON.stringify(newEntity));
    }

    const htmlFileName = `${entityId}.html`;
    const htmlFilePath = path.join(PROFILE_OUTPUT_DIR, htmlFileName);
    fs.writeFileSync(htmlFilePath, cleanedHtml);

    const mapping = {
      profile_name: profileName,
      source_path: path.relative(ROOT_DIR, filePath).replace(/\\/g, '/'),
      testament,
      entity_id: entityId,
      entity_name: entityName,
      entity_type: entityType,
      status,
      match_strategy: matchStrategy,
      match_source: matchSource,
      match_score: matchScore,
      html_path: `/assets/data/character-profiles/${htmlFileName}`,
      summary: profileSummary,
      book_references: profileBookReferences,
    };

    profileMappings.push(mapping);
  });

  const profilesByEntityId = {};
  profileMappings.forEach(mapping => {
    profilesByEntityId[mapping.entity_id] = mapping;
  });

  const expectedHtmlFiles = new Set(
    profileMappings.map(mapping => path.basename(mapping.html_path))
  );
  const existingHtmlFiles = fs
    .readdirSync(PROFILE_OUTPUT_DIR)
    .filter(file => file.endsWith('.html'));

  existingHtmlFiles.forEach(file => {
    if (!expectedHtmlFiles.has(file)) {
      fs.unlinkSync(path.join(PROFILE_OUTPUT_DIR, file));
    }
  });

  const summary = {
    generated_at: new Date().toISOString(),
    total_profiles: profileMappings.length,
    matched_existing: profileMappings.filter(item => item.status === 'matched').length,
    created_entities: profileMappings.filter(item => item.status === 'created').length,
    profiles: profileMappings.sort((a, b) => a.profile_name.localeCompare(b.profile_name)),
    profilesByEntityId,
  };

  fs.writeFileSync(PROFILE_INDEX_FILE, JSON.stringify(summary, null, 2));

  const createdEntityIds = new Set(
    profileMappings.filter(item => item.status === 'created').map(item => item.entity_id)
  );
  cleanupGeneratedEntities(baseEntityIds, createdEntityIds);

  updateEntitySearchIndex(newEntities);
  updateEntityIds(newEntityIds);

  console.log(`OK Character profile sync complete.`);
  console.log(`   Profiles: ${summary.total_profiles}`);
  console.log(`   Matched: ${summary.matched_existing}`);
  console.log(`   Created: ${summary.created_entities}`);
}

syncCharacterProfiles().catch(error => {
  console.error('ERROR Character profile sync failed:', error);
  process.exit(1);
});
