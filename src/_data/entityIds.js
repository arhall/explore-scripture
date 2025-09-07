const fs = require('fs');
const path = require('path');

/**
 * Generate entity IDs for pagination in entities.njk
 */
module.exports = function() {
  try {
    const entitiesDir = path.join(__dirname, '../assets/data/entities');
    
    if (!fs.existsSync(entitiesDir)) {
      console.log('Entities directory not found, returning empty array');
      return [];
    }
    
    const entityFiles = fs.readdirSync(entitiesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.basename(file, '.json'));
    
    console.log(`Found ${entityFiles.length} entity files for pagination`);
    return entityFiles;
    
  } catch (error) {
    console.error('Error loading entity IDs:', error);
    return [];
  }
};