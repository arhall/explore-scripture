#!/usr/bin/env node

/**
 * Validate Entity Data Schema
 * Checks that all entity JSON files conform to expected schema structure
 */

const fs = require('fs');
const path = require('path');

// Expected schema for entity data
const ENTITY_SCHEMA = {
  required: ['id', 'name', 'type'],
  optional: ['blurb', 'category', 'references', 'cross_references', 'book_references', 'source_testaments', 'canonicalized_from', 'relations'],
  types: {
    id: 'string',
    name: 'string',
    type: 'string',
    blurb: 'string',
    category: 'string',
    references: 'array',
    cross_references: 'array',
    book_references: 'object',
    source_testaments: 'array',
    canonicalized_from: 'array',
    relations: 'object'
  }
};

function validateEntitySchema(entity, _filePath) {
  const errors = [];
  
  // Check required fields
  for (const field of ENTITY_SCHEMA.required) {
    if (!Object.prototype.hasOwnProperty.call(entity, field)) {
      errors.push(`Missing required field: ${field}`);
    } else if (entity[field] === null || entity[field] === undefined) {
      errors.push(`Required field ${field} is null/undefined`);
    }
  }
  
  // Check field types
  for (const [field, expectedType] of Object.entries(ENTITY_SCHEMA.types)) {
    if (Object.prototype.hasOwnProperty.call(entity, field) && entity[field] !== null && entity[field] !== undefined) {
      const actualType = Array.isArray(entity[field]) ? 'array' : typeof entity[field];
      if (actualType !== expectedType) {
        errors.push(`Field ${field} should be ${expectedType}, got ${actualType}`);
      }
    }
  }
  
  // Validate ID format (should contain entity type prefix and hash)
  if (entity.id && typeof entity.id === 'string') {
    if (!entity.id.match(/^[a-z]+\..+--[a-f0-9]+$/)) {
      errors.push(`ID format invalid: ${entity.id} (expected format: type.name--hash)`);
    }
  }
  
  // Validate entity type
  const validTypes = ['person', 'place', 'divine', 'title', 'figure', 'event', 'group', 'entity'];
  if (entity.type && !validTypes.includes(entity.type)) {
    errors.push(`Invalid entity type: ${entity.type} (valid types: ${validTypes.join(', ')})`);
  }
  
  return errors;
}

async function validateAllEntityFiles() {
  console.log('🔍 Validating Entity JSON Schema\n');
  
  const entitiesDir = 'src/assets/data/entities';
  const bookEntitiesDir = 'src/assets/data/books';
  
  let totalFiles = 0;
  let validFiles = 0;
  let invalidFiles = 0;
  const allErrors = [];
  
  try {
    // Validate individual entity files
    console.log('📁 Validating individual entity files...');
    
    if (fs.existsSync(entitiesDir)) {
      const entityFiles = fs.readdirSync(entitiesDir).filter(file => file.endsWith('.json'));
      
      for (const file of entityFiles) {
        const filePath = path.join(entitiesDir, file);
        totalFiles++;
        
        try {
          const entityData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const errors = validateEntitySchema(entityData, filePath);
          
          if (errors.length === 0) {
            validFiles++;
          } else {
            invalidFiles++;
            console.log(`❌ ${file}: ${errors.length} errors`);
            errors.forEach(error => console.log(`   - ${error}`));
            allErrors.push({ file, errors });
          }
        } catch (parseError) {
          invalidFiles++;
          console.log(`❌ ${file}: JSON parse error - ${parseError.message}`);
          allErrors.push({ file, errors: [`JSON parse error: ${parseError.message}`] });
        }
      }
    }
    
    // Validate book entity files
    console.log('\n📚 Validating book entity files...');
    
    if (fs.existsSync(bookEntitiesDir)) {
      const bookFiles = fs.readdirSync(bookEntitiesDir).filter(file => file.endsWith('-entities.json'));
      
      for (const file of bookFiles) {
        const filePath = path.join(bookEntitiesDir, file);
        totalFiles++;
        
        try {
          const bookData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          
          if (!Array.isArray(bookData)) {
            invalidFiles++;
            console.log(`❌ ${file}: Book entity file should be an array`);
            allErrors.push({ file, errors: ['Book entity file should be an array'] });
            continue;
          }
          
          let fileValid = true;
          const fileErrors = [];
          
          for (let i = 0; i < bookData.length; i++) {
            const entity = bookData[i];
            const errors = validateEntitySchema(entity, `${filePath}[${i}]`);
            if (errors.length > 0) {
              fileValid = false;
              fileErrors.push(...errors.map(err => `Entity ${i}: ${err}`));
            }
          }
          
          if (fileValid) {
            validFiles++;
          } else {
            invalidFiles++;
            console.log(`❌ ${file}: ${fileErrors.length} errors`);
            fileErrors.forEach(error => console.log(`   - ${error}`));
            allErrors.push({ file, errors: fileErrors });
          }
        } catch (parseError) {
          invalidFiles++;
          console.log(`❌ ${file}: JSON parse error - ${parseError.message}`);
          allErrors.push({ file, errors: [`JSON parse error: ${parseError.message}`] });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return;
  }
  
  // Summary
  console.log('\n📊 Validation Summary:');
  console.log(`   ✅ Valid files: ${validFiles}/${totalFiles}`);
  console.log(`   ❌ Invalid files: ${invalidFiles}/${totalFiles}`);
  console.log(`   📝 Total errors: ${allErrors.reduce((sum, item) => sum + item.errors.length, 0)}`);
  
  if (invalidFiles === 0) {
    console.log('\n🎉 All entity files pass schema validation!');
  } else {
    console.log(`\n⚠️  ${invalidFiles} files need attention.`);
    
    // Show most common errors
    const errorCounts = {};
    allErrors.forEach(({ errors }) => {
      errors.forEach(error => {
        const errorType = error.split(':')[0];
        errorCounts[errorType] = (errorCounts[errorType] || 0) + 1;
      });
    });
    
    console.log('\n🔍 Most common errors:');
    Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([error, count]) => {
        console.log(`   • ${error}: ${count} occurrences`);
      });
  }
}

// Run validation
validateAllEntityFiles().catch(error => {
  console.error('❌ Validation script failed:', error);
  process.exit(1);
});