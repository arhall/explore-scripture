/**
 * Generate search data for the Bible Explorer search engine
 * Creates JSON files with all searchable content
 */

const books = require('./src/_data/books.json');
const characters = require('./src/_data/characters.js');
const characterProfiles = require('./src/_data/characterProfiles.js');
const categories = require('./src/_data/categories.js');

module.exports = function() {
  // Generate comprehensive search data
  const searchData = {
    timestamp: new Date().toISOString(),
    books: processBooks(),
    characters: processCharacters(),
    categories: processCategories()
  };
  
  return searchData;
};

function processBooks() {
  return books.map(book => {
    // Extract chapter summaries for better searchability
    const chapterData = book.chapterSummaries ? 
      Object.entries(book.chapterSummaries).map(([num, summary]) => ({
        number: parseInt(num),
        summary: summary
      })) : [];
    
    return {
      name: book.name,
      slug: book.slug,
      testament: book.testament,
      category: book.category,
      author: book.author,
      language: book.language,
      chapterCount: chapterData.length,
      chapters: chapterData,
      // Build searchable keywords from all content
      keywords: generateBookKeywords(book),
      url: `/books/${book.slug}/`
    };
  });
}

function processCharacters() {
  const charactersData = characters();
  const profiles = characterProfiles();
  
  // Extract the characters array from the returned data
  const charactersList = charactersData.characters || [];
  
  return charactersList.map(character => {
    const profile = profiles[character.name] || {};
    
    return {
      name: character.name,
      slug: character.slug,
      testament: character.testament,
      category: character.category || profile.category,
      description: generateCharacterDescription(character, profile),
      keyWords: generateCharacterKeywords(character, profile),
      appearances: character.appearances || [],
      url: `/characters/${character.slug}/`,
      hasProfile: !!profile.name
    };
  });
}

function processCategories() {
  return categories.map(category => {
    // Get books in this category for context
    const categoryBooks = books.filter(book => book.category === category.name);
    
    return {
      name: category.name,
      slug: category.slug,
      testament: category.testament,
      description: category.description,
      themes: category.themes || [],
      keyFigures: category.keyFigures || [],
      bookCount: category.bookCount || categoryBooks.length,
      timeSpan: category.timeSpan,
      books: categoryBooks.map(book => book.name),
      url: `/categories/${category.slug}/`
    };
  });
}

function generateBookKeywords(book) {
  const keywords = new Set();
  
  // Add basic info
  if (book.name) keywords.add(book.name.toLowerCase());
  if (book.testament) keywords.add(book.testament.toLowerCase());
  if (book.category) keywords.add(book.category.toLowerCase());
  if (book.author) keywords.add(book.author.toLowerCase());
  if (book.language) keywords.add(book.language.toLowerCase());
  
  // Add common abbreviations and alternate names
  const abbreviations = getBookAbbreviations(book.name);
  abbreviations.forEach(abbr => keywords.add(abbr.toLowerCase()));
  
  // Extract keywords from chapter summaries
  if (book.chapterSummaries) {
    Object.values(book.chapterSummaries).forEach(summary => {
      const summaryKeywords = extractKeywords(summary);
      summaryKeywords.forEach(keyword => keywords.add(keyword));
    });
  }
  
  return Array.from(keywords);
}

function generateCharacterDescription(character, profile) {
  if (profile.thematicRole) {
    return profile.thematicRole;
  }
  
  if (character.appearances && character.appearances.length > 0) {
    return `Biblical character appearing in ${character.appearances.length} book${character.appearances.length > 1 ? 's' : ''}.`;
  }
  
  return 'Biblical character mentioned in Scripture.';
}

function generateCharacterKeywords(character, profile) {
  const keywords = new Set();
  
  // Add basic info
  if (character.name) keywords.add(character.name.toLowerCase());
  if (character.testament) keywords.add(character.testament.toLowerCase());
  if (character.category) keywords.add(character.category.toLowerCase());
  
  // Add profile information
  if (profile.category) keywords.add(profile.category.toLowerCase());
  if (profile.thematicRole) {
    const roleKeywords = extractKeywords(profile.thematicRole);
    roleKeywords.forEach(keyword => keywords.add(keyword));
  }
  
  // Add elements of power
  if (profile.elementsOfPower) {
    profile.elementsOfPower.forEach(element => {
      const elementKeywords = extractKeywords(element);
      elementKeywords.forEach(keyword => keywords.add(keyword));
    });
  }
  
  // Add gospel connections
  if (profile.gospelConnections) {
    const connectionKeywords = extractKeywords(profile.gospelConnections);
    connectionKeywords.forEach(keyword => keywords.add(keyword));
  }
  
  // Add appearances
  if (character.appearances) {
    character.appearances.forEach(appearance => {
      if (typeof appearance === 'string') {
        keywords.add(appearance.toLowerCase());
      } else if (appearance && appearance.book) {
        keywords.add(appearance.book.toLowerCase());
      }
    });
  }
  
  return Array.from(keywords);
}

function extractKeywords(text) {
  if (!text || typeof text !== 'string') return [];
  
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'his', 'her', 'him', 'she', 'he', 'it', 'they', 'them', 'their', 'that', 'this', 'these', 'those', 'from', 'up', 'out', 'down', 'into', 'over', 'under', 'again', 'further', 'then', 'once']);
  
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => 
      word.length > 2 && 
      !stopWords.has(word) &&
      !word.match(/^\d+$/) // Filter out standalone numbers
    );
}

function getBookAbbreviations(bookName) {
  const abbreviations = {
    'Genesis': ['Gen', 'Ge', 'Gn'],
    'Exodus': ['Exo', 'Ex', 'Exod'],
    'Leviticus': ['Lev', 'Le', 'Lv'],
    'Numbers': ['Num', 'Nu', 'Nm', 'Nb'],
    'Deuteronomy': ['Deu', 'Dt', 'De', 'Deut'],
    'Joshua': ['Jos', 'Jsh', 'Josh'],
    'Judges': ['Jdg', 'Jg', 'Jdgs'],
    'Ruth': ['Rth', 'Ru'],
    '1 Samuel': ['1Sa', '1 Sam', '1S', 'I Sam', 'I Sa', '1Sam'],
    '2 Samuel': ['2Sa', '2 Sam', '2S', 'II Sam', 'II Sa', '2Sam'],
    '1 Kings': ['1Ki', '1 Kin', '1K', 'I Kin', 'I Ki', '1Kings'],
    '2 Kings': ['2Ki', '2 Kin', '2K', 'II Kin', 'II Ki', '2Kings'],
    '1 Chronicles': ['1Ch', '1 Chr', '1C', 'I Chr', 'I Ch', '1Chron'],
    '2 Chronicles': ['2Ch', '2 Chr', '2C', 'II Chr', 'II Ch', '2Chron'],
    'Ezra': ['Ezr', 'Ez'],
    'Nehemiah': ['Neh', 'Ne'],
    'Esther': ['Est', 'Es'],
    'Job': ['Job', 'Jb'],
    'Psalms': ['Psa', 'Ps', 'Psalm', 'Pslm'],
    'Proverbs': ['Pro', 'Pr', 'Prv', 'Prov'],
    'Ecclesiastes': ['Ecc', 'Ec', 'Eccl'],
    'Song of Songs': ['Son', 'So', 'SOS', 'Song', 'Canticles', 'Song of Solomon'],
    'Isaiah': ['Isa', 'Is'],
    'Jeremiah': ['Jer', 'Je', 'Jr'],
    'Lamentations': ['Lam', 'La'],
    'Ezekiel': ['Eze', 'Ezk', 'Ezek'],
    'Daniel': ['Dan', 'Da', 'Dn'],
    'Hosea': ['Hos', 'Ho'],
    'Joel': ['Joe', 'Jl'],
    'Amos': ['Amo', 'Am'],
    'Obadiah': ['Oba', 'Ob'],
    'Jonah': ['Jon', 'Jnh'],
    'Micah': ['Mic', 'Mc'],
    'Nahum': ['Nah', 'Na'],
    'Habakkuk': ['Hab', 'Hb'],
    'Zephaniah': ['Zep', 'Zp'],
    'Haggai': ['Hag', 'Hg'],
    'Zechariah': ['Zec', 'Zc', 'Zech'],
    'Malachi': ['Mal', 'Ml'],
    'Matthew': ['Mat', 'Mt', 'Matt'],
    'Mark': ['Mar', 'Mk', 'Mr'],
    'Luke': ['Luk', 'Lk', 'Lu'],
    'John': ['Joh', 'Jn', 'Jhn'],
    'Acts': ['Act', 'Ac'],
    'Romans': ['Rom', 'Ro', 'Rm'],
    '1 Corinthians': ['1Co', '1 Cor', '1C', 'I Cor', 'I Co', '1Cor'],
    '2 Corinthians': ['2Co', '2 Cor', '2C', 'II Cor', 'II Co', '2Cor'],
    'Galatians': ['Gal', 'Ga'],
    'Ephesians': ['Eph', 'Ep'],
    'Philippians': ['Phi', 'Php', 'Ph'],
    'Colossians': ['Col', 'Co'],
    '1 Thessalonians': ['1Th', '1 Thes', '1T', 'I Th', 'I Thes', '1Thess'],
    '2 Thessalonians': ['2Th', '2 Thes', '2T', 'II Th', 'II Thes', '2Thess'],
    '1 Timothy': ['1Ti', '1 Tim', '1T', 'I Tim', 'I Ti', '1Tim'],
    '2 Timothy': ['2Ti', '2 Tim', '2T', 'II Tim', 'II Ti', '2Tim'],
    'Titus': ['Tit', 'Ti'],
    'Philemon': ['Phm', 'Pm'],
    'Hebrews': ['Heb', 'He'],
    'James': ['Jam', 'Jas', 'Jm'],
    '1 Peter': ['1Pe', '1 Pet', '1P', 'I Pet', 'I Pe', '1Pet'],
    '2 Peter': ['2Pe', '2 Pet', '2P', 'II Pet', 'II Pe', '2Pet'],
    '1 John': ['1Jo', '1 Joh', '1J', 'I Joh', 'I Jo', '1John'],
    '2 John': ['2Jo', '2 Joh', '2J', 'II Joh', 'II Jo', '2John'],
    '3 John': ['3Jo', '3 Joh', '3J', 'III Joh', 'III Jo', '3John'],
    'Jude': ['Jud', 'Jd'],
    'Revelation': ['Rev', 'Re', 'Apoc', 'Apocalypse']
  };
  
  return abbreviations[bookName] || [];
}