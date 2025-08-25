const fs = require('fs');
const path = require('path');

module.exports = function() {
  const charactersDir = path.join(__dirname, 'charatersByBook');
  const characters = new Map();
  
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
              characters.set(slug, {
                name: normalizedName,
                slug: slug,
                appearances: []
              });
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
    });
    
    // Sort characters by total appearances (most frequent first)
    charactersArray.sort((a, b) => b.totalAppearances - a.totalAppearances);
    
    return charactersArray;
    
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