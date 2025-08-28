// Only include characters with 3+ appearances for individual pages
const charactersData = require('./characters.js');

module.exports = function() {
  const data = charactersData();
  const allCharacters = data.characters || data; // Handle both old and new format
  
  // Filter to only characters with 3 or more appearances for individual pages
  // This reduces the number of pages from 1200+ to ~400
  const significantCharacters = allCharacters.filter(char => char.totalAppearances >= 3);
  
  console.log(`Generating individual pages for ${significantCharacters.length} characters (${allCharacters.length} total)`);
  console.log(`- Major characters: ${significantCharacters.filter(c => c.significance === 'major').length}`);
  console.log(`- Prominent characters: ${significantCharacters.filter(c => c.significance === 'prominent').length}`);
  console.log(`- Notable characters: ${significantCharacters.filter(c => c.significance === 'notable').length}`);
  
  return significantCharacters;
};