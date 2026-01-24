const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROFILE_INDEX = path.join(
  ROOT_DIR,
  'src',
  'assets',
  'data',
  'character-profiles',
  'index.json'
);

function walkDirectory(dirPath) {
  const results = [];
  if (!fs.existsSync(dirPath)) return results;

  fs.readdirSync(dirPath, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDirectory(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  });

  return results;
}

describe('Character Profile Mapping', () => {
  let profileIndex;

  beforeAll(() => {
    profileIndex = JSON.parse(fs.readFileSync(PROFILE_INDEX, 'utf8'));
  });

  test('profile index exists with expected structure', () => {
    expect(profileIndex).toBeDefined();
    expect(profileIndex).toHaveProperty('generated_at');
    expect(profileIndex).toHaveProperty('profiles');
    expect(profileIndex).toHaveProperty('profilesByEntityId');
    expect(Array.isArray(profileIndex.profiles)).toBe(true);
  });

  test('every character profile file has a mapping', () => {
    const profileFiles = [
      ...walkDirectory(path.join(ROOT_DIR, 'NTCharacters')),
      ...walkDirectory(path.join(ROOT_DIR, 'OTCharacters')),
    ].filter(filePath => {
      const baseName = path.basename(filePath, '.md');
      return !baseName.startsWith('List-');
    });

    const mappedSources = new Set(profileIndex.profiles.map(profile => profile.source_path));

    profileFiles.forEach(filePath => {
      const relativePath = path.relative(ROOT_DIR, filePath).split(path.sep).join('/');
      expect(mappedSources.has(relativePath)).toBe(true);
    });
  });

  test('every mapping has a profile HTML artifact and entity JSON', () => {
    profileIndex.profiles.forEach(profile => {
      const htmlPath = path.join(
        ROOT_DIR,
        profile.html_path.replace('/assets/', 'src/assets/')
      );
      expect(fs.existsSync(htmlPath)).toBe(true);

      const entityPath = path.join(
        ROOT_DIR,
        'src',
        'assets',
        'data',
        'entities',
        `${profile.entity_id}.json`
      );
      expect(fs.existsSync(entityPath)).toBe(true);
    });
  });

  test('profile mappings include extracted book references', () => {
    const profilesWithRefs = profileIndex.profiles.filter(
      profile => profile.book_references && Object.keys(profile.book_references).length > 0
    );

    expect(profilesWithRefs.length).toBeGreaterThan(0);

    profileIndex.profiles.forEach(profile => {
      expect(profile).toHaveProperty('book_references');
    });
  });

  test('profile lookup by entity id is available for key figures', () => {
    const lookup = profileIndex.profilesByEntityId;
    expect(lookup).toBeDefined();

    const expectedNames = ['David', 'Abraham', 'Moses'];
    expectedNames.forEach(name => {
      const match = profileIndex.profiles.find(profile => profile.profile_name === name);
      expect(match).toBeDefined();
      expect(lookup[match.entity_id]).toBeDefined();
    });
  });
});
