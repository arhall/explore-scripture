// Only include characters with 3+ appearances for individual pages
const characters = require('./characters.js');

module.exports = function() {
  const allCharacters = characters();
  
  // Filter to only characters with 3 or more appearances for individual pages
  // This reduces the number of pages from 1200+ to ~400
  const significantCharacters = allCharacters.filter(char => char.totalAppearances >= 3);
  
  console.log(`Generating individual pages for ${significantCharacters.length} characters (${allCharacters.length} total)`);
  
  return significantCharacters;
};