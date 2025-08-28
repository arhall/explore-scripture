const fs = require('fs');
const path = require('path');

module.exports = function() {
  const charactersDir = path.join(__dirname, 'charactersByBook');
  const characters = new Map();
  
  // Load character profiles for biographical enrichment
  const characterProfiles = require('./characterProfiles.js')();
  
  try {
    // Get all character JSON files
    const files = fs.readdirSync(charactersDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Process each book's character data
    jsonFiles.forEach(file => {
      try {
        const bookPath = path.join(charactersDir, file);
        const bookData = JSON.parse(fs.readFileSync(bookPath, 'utf8'));
        const bookName = Object.keys(bookData)[0];
        
        // Process each chapter
        Object.entries(bookData[bookName]).forEach(([chapter, characterList]) => {
          characterList.forEach(characterName => {
            // Normalize character names and create slug
            const normalizedName = characterName.trim();
            const slug = createSlug(normalizedName);
            
            if (!characters.has(slug)) {
              // Check if we have detailed profile data for this character
              const profile = characterProfiles[normalizedName] || 
                             Object.values(characterProfiles).find(p => 
                               p && p.name && (p.name === normalizedName || p.name.includes(normalizedName))
                             );
              
              const characterData = {
                name: normalizedName,
                slug: slug,
                appearances: [],
                // Add biographical data if available
                ...(profile && {
                  testament: profile.testament,
                  category: profile.category,
                  thematicRole: profile.thematicRole,
                  elementsOfPower: profile.elementsOfPower,
                  weaknessesAndFailures: profile.weaknessesAndFailures,
                  victoriesOverDifficulties: profile.victoriesOverDifficulties,
                  privilegesAbused: profile.privilegesAbused,
                  relationshipToGod: profile.relationshipToGod,
                  keyVerses: profile.keyVerses,
                  lifeEvents: profile.lifeEvents,
                  characterType: profile.characterType,
                  modernApplication: profile.modernApplication,
                  hasDetailedProfile: true
                })
              };
              
              characters.set(slug, characterData);
            }
            
            // Add appearance
            const character = characters.get(slug);
            const existingAppearance = character.appearances.find(app => 
              app.book === bookName && app.chapter === chapter
            );
            
            if (!existingAppearance) {
              character.appearances.push({
                book: bookName,
                chapter: parseInt(chapter),
                bookSlug: createSlug(bookName)
              });
            }
          });
        });
        
      } catch (bookError) {
        console.warn(`Error processing character file ${file}:`, bookError.message);
      }
    });
    
    // Convert to array and sort
    const charactersArray = Array.from(characters.values());
    
    // Sort appearances within each character by book order and chapter
    const bookOrder = [
      'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', 
      '1Samuel', '2Samuel', '1Kings', '2Kings', '1Chronicles', '2Chronicles', 'Ezra', 'Nehemiah', 
      'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'SongOfSolomon', 'Isaiah', 'Jeremiah', 
      'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 
      'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 
      'Luke', 'John', 'Acts', 'Romans', '1Corinthians', '2Corinthians', 'Galatians', 'Ephesians', 
      'Philippians', 'Colossians', '1Thessalonians', '2Thessalonians', '1Timothy', '2Timothy', 
      'Titus', 'Philemon', 'Hebrews', 'James', '1Peter', '2Peter', '1John', '2John', '3John', 
      'Jude', 'Revelation'
    ];
    
    charactersArray.forEach(character => {
      character.appearances.sort((a, b) => {
        const aBookIndex = bookOrder.indexOf(a.book);
        const bBookIndex = bookOrder.indexOf(b.book);
        
        if (aBookIndex !== bBookIndex) {
          return aBookIndex - bBookIndex;
        }
        
        return a.chapter - b.chapter;
      });
      
      // Calculate total appearances
      character.totalAppearances = character.appearances.length;
      
      // Get unique books
      character.books = [...new Set(character.appearances.map(app => app.book))];
      character.totalBooks = character.books.length;
      
      // Add character categorization and basic profile for all characters
      if (character.hasDetailedProfile) {
        character.significance = 'major';
      } else if (character.totalAppearances >= 10) {
        character.significance = 'prominent';
        // Add basic profile for prominent characters
        character.basicProfile = generateBasicProfile(character, 'prominent');
      } else if (character.totalAppearances >= 3) {
        character.significance = 'notable';
        // Add basic profile for notable characters
        character.basicProfile = generateBasicProfile(character, 'notable');
      } else {
        character.significance = 'minor';
        // Add basic profile for minor characters
        character.basicProfile = generateBasicProfile(character, 'minor');
      }
      
      // Add testament classification based on appearances
      const oldTestamentBooks = bookOrder.slice(0, 39);
      const newTestamentBooks = bookOrder.slice(39);
      const oldTestamentAppearances = character.appearances.filter(app => oldTestamentBooks.includes(app.book)).length;
      const newTestamentAppearances = character.appearances.filter(app => newTestamentBooks.includes(app.book)).length;
      
      if (oldTestamentAppearances && newTestamentAppearances) {
        character.testament = 'Both';
      } else if (newTestamentAppearances) {
        character.testament = character.testament || 'New';
      } else {
        character.testament = character.testament || 'Old';
      }
    });
    
    // Sort characters by total appearances (most frequent first)
    charactersArray.sort((a, b) => b.totalAppearances - a.totalAppearances);
    
    // Add metadata about the character collection
    const metadata = {
      totalCharacters: charactersArray.length,
      majorCharacters: charactersArray.filter(c => c.significance === 'major').length,
      prominentCharacters: charactersArray.filter(c => c.significance === 'prominent').length,
      notableCharacters: charactersArray.filter(c => c.significance === 'notable').length,
      minorCharacters: charactersArray.filter(c => c.significance === 'minor').length,
      oldTestamentCharacters: charactersArray.filter(c => c.testament === 'Old').length,
      newTestamentCharacters: charactersArray.filter(c => c.testament === 'New').length,
      bothTestamentCharacters: charactersArray.filter(c => c.testament === 'Both').length,
      charactersWithProfiles: charactersArray.filter(c => c.hasDetailedProfile).length,
      characterCategories: characterProfiles.characterCategories,
      thematicRoles: characterProfiles.thematicRoles
    };
    
    return {
      characters: charactersArray,
      metadata: metadata
    };
    
  } catch (error) {
    console.error('Error building characters data:', error);
    return [];
  }
};

function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single
    .trim();
}

function generateBasicProfile(character, significance) {
  const name = character.name;
  const appearances = character.totalAppearances;
  const books = character.books;
  const testament = character.testament;
  
  // Common biblical roles and contexts
  const commonRoles = {
    'God': { role: 'Creator and Sovereign', significance: 'Central to all Scripture' },
    'Jesus': { role: 'Messiah and Savior', significance: 'The central figure of the New Testament' },
    'Moses': { role: 'Lawgiver and Prophet', significance: 'Led Israel from Egypt and received the Law' },
    'David': { role: 'King and Psalmist', significance: 'Model king and ancestor of Christ' },
    'Abraham': { role: 'Father of Faith', significance: 'Patriarch and covenant recipient' },
    'Paul': { role: 'Apostle to Gentiles', significance: 'Primary New Testament missionary' },
    'Peter': { role: 'Leading Apostle', significance: 'Spokesman for the early church' },
    'John': { role: 'Beloved Disciple', significance: 'Apostle of love and revelation' },
    'Mary': { role: 'Mother of Jesus', significance: 'Chosen vessel for the Incarnation' },
    'Joseph': { role: 'Dreamer and Ruler', significance: 'Preserved Israel during famine' },
    'Isaiah': { role: 'Major Prophet', significance: 'Prophesied extensively about the Messiah' },
    'Jeremiah': { role: 'Weeping Prophet', significance: 'Called Israel to repentance' },
    'Ezekiel': { role: 'Exilic Prophet', significance: 'Ministered during Babylonian captivity' },
    'Daniel': { role: 'Prophet and Statesman', significance: 'Faithful in foreign court' },
    'Solomon': { role: 'Wise King', significance: 'Built the temple but fell into idolatry' },
    'Elijah': { role: 'Mighty Prophet', significance: 'Confronted false prophets and kings' },
    'Joshua': { role: 'Military Leader', significance: 'Led conquest of the Promised Land' },
    'Samuel': { role: 'Prophet and Judge', significance: 'Anointed first kings of Israel' },
    'Noah': { role: 'Righteous Survivor', significance: 'Preserved humanity through the flood' },
    'Jacob': { role: 'Patriarch Israel', significance: 'Father of the twelve tribes' },
    'Isaac': { role: 'Promised Son', significance: 'Child of promise and sacrifice' },
    'Sarah': { role: 'Matriarch', significance: 'Mother of the promised seed' },
    'Ruth': { role: 'Faithful Convert', significance: 'Model of loyalty and redemption' },
    'Esther': { role: 'Courageous Queen', significance: 'Saved the Jewish people' },
    'Job': { role: 'Patient Sufferer', significance: 'Model of faith through trials' },
    'Jonah': { role: 'Reluctant Prophet', significance: 'Preached to Nineveh' },
    'John the Baptist': { role: 'Forerunner', significance: 'Prepared the way for Christ' },
    'Mary Magdalene': { role: 'Faithful Follower', significance: 'First witness to resurrection' },
    'Stephen': { role: 'First Martyr', significance: 'Died for his faith in Christ' },
    'Barnabas': { role: 'Encourager', significance: 'Missionary partner with Paul' },
    'Timothy': { role: 'Young Pastor', significance: "Paul's spiritual son and co-worker" },
    'Luke': { role: 'Physician-Evangelist', significance: 'Gospel writer and historian' },
    'Mark': { role: 'Gospel Writer', significance: 'Companion of Peter and Paul' },
    'Matthew': { role: 'Tax Collector-Apostle', significance: 'Called from despised profession' },
    'Thomas': { role: 'Doubting Disciple', significance: 'Questioned but came to faith' },
    'James': { role: 'Church Leader', significance: 'Brother of Jesus and Jerusalem leader' },
    'Judas Iscariot': { role: 'Betrayer', significance: 'Warning against greed and treachery' },
    'Pilate': { role: 'Roman Governor', significance: 'Judged Jesus but found no fault' },
    'Herod': { role: 'Puppet King', significance: 'Opposed Christ and the early church' },
    'Pharaoh': { role: 'Oppressive Ruler', significance: 'Hardened heart against God' },
    'Nebuchadnezzar': { role: 'Babylonian King', significance: 'Learned to acknowledge God' },
    'Cyrus': { role: 'Persian King', significance: 'Used by God to restore Israel' }
  };
  
  // Get specific role info if available
  const roleInfo = commonRoles[name] || commonRoles[name.split(' ')[0]];
  
  let profile = {
    significance: significance,
    testament: testament,
    totalAppearances: appearances,
    totalBooks: books.length,
    primaryBooks: books.slice(0, 3),
    description: generateDescription(name, significance, appearances, testament, books),
  };
  
  if (roleInfo) {
    profile.role = roleInfo.role;
    profile.biblicalSignificance = roleInfo.significance;
  } else {
    // Generate generic role based on context
    profile.role = inferRole(name, books, testament);
    profile.biblicalSignificance = generateGenericSignificance(significance, appearances, testament);
  }
  
  // Add contextual insights based on books they appear in
  profile.contextualInsights = generateContextualInsights(name, books, testament);
  
  return profile;
}

function generateDescription(name, significance, appearances, testament, books) {
  const testamentText = testament === 'Both' ? 'both Old and New Testament' : 
                       testament === 'Old' ? 'Old Testament' : 'New Testament';
  
  if (significance === 'prominent') {
    return `${name} is a prominent ${testamentText} figure, appearing ${appearances} times across ${books.length} biblical books. Their frequent mention indicates significant importance to the biblical narrative.`;
  } else if (significance === 'notable') {
    return `${name} appears ${appearances} times in ${books.length} biblical books, playing a notable role in the ${testamentText} story.`;
  } else {
    return `${name} is mentioned ${appearances} time${appearances > 1 ? 's' : ''} in the ${testamentText}, contributing to the broader biblical narrative.`;
  }
}

function inferRole(name, books, testament) {
  // Basic role inference based on book patterns
  if (books.includes('Genesis') && books.length <= 3) return 'Early Biblical Figure';
  if (books.includes('Exodus') || books.includes('Numbers') || books.includes('Deuteronomy')) return 'Exodus Generation';
  if (books.includes('Joshua') || books.includes('Judges')) return 'Conquest Period Figure';
  if (books.includes('1Samuel') || books.includes('2Samuel') || books.includes('1Kings') || books.includes('2Kings')) return 'Monarchic Period Figure';
  if (books.includes('1Chronicles') || books.includes('2Chronicles') || books.includes('Ezra') || books.includes('Nehemiah')) return 'Post-Exilic Figure';
  if (books.includes('Matthew') || books.includes('Mark') || books.includes('Luke') || books.includes('John')) return 'Gospel Era Figure';
  if (books.includes('Acts')) return 'Early Church Figure';
  if (books.some(b => ['Romans', '1Corinthians', '2Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1Thessalonians', '2Thessalonians', '1Timothy', '2Timothy', 'Titus', 'Philemon'].includes(b))) return 'Pauline Ministry Figure';
  
  return testament === 'Old' ? 'Old Testament Figure' : 'New Testament Figure';
}

function generateGenericSignificance(significance, appearances, testament) {
  if (significance === 'prominent') {
    return `Their ${appearances} appearances across multiple books indicate substantial importance to the biblical story and God's redemptive plan.`;
  } else if (significance === 'notable') {
    return `Though mentioned fewer times, their presence in the biblical record contributes meaningfully to the overall narrative.`;
  } else {
    return `Even brief appearances in Scripture serve God's purposes and contribute to the complete biblical story.`;
  }
}

function generateContextualInsights(name, books, testament) {
  const insights = [];
  
  // Law books
  if (books.some(b => ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'].includes(b))) {
    insights.push('Connected to foundational biblical events and the establishment of Israel');
  }
  
  // Historical books
  if (books.some(b => ['Joshua', 'Judges', 'Ruth', '1Samuel', '2Samuel', '1Kings', '2Kings', '1Chronicles', '2Chronicles', 'Ezra', 'Nehemiah', 'Esther'].includes(b))) {
    insights.push('Part of Israel\'s historical narrative and national development');
  }
  
  // Prophetic books
  if (books.some(b => ['Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'].includes(b))) {
    insights.push('Associated with prophetic ministry and God\'s messages to His people');
  }
  
  // Gospels
  if (books.some(b => ['Matthew', 'Mark', 'Luke', 'John'].includes(b))) {
    insights.push('Witnessed or was impacted by Jesus Christ\'s earthly ministry');
  }
  
  // Epistles
  if (books.some(b => ['Romans', '1Corinthians', '2Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1Thessalonians', '2Thessalonians', '1Timothy', '2Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1Peter', '2Peter', '1John', '2John', '3John', 'Jude'].includes(b))) {
    insights.push('Connected to early church development and apostolic teaching');
  }
  
  // Cross-testament appearances
  if (testament === 'Both') {
    insights.push('Bridges Old and New Testament themes, showing continuity in God\'s plan');
  }
  
  return insights.length > 0 ? insights : ['Contributes to the complete biblical narrative of God\'s redemptive work'];
}