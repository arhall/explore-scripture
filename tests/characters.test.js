const fs = require('fs');
const path = require('path');

describe('Characters Data Tests', () => {
  let charactersModule;
  let characters;
  let charactersForPages;

  beforeAll(() => {
    // Mock console to suppress expected warnings during tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    charactersModule = require('../src/_data/characters.js');
    characters = charactersModule();
    
    const charactersForPagesModule = require('../src/_data/charactersForPages.js');
    charactersForPages = charactersForPagesModule();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Characters Data Generation', () => {
    test('should generate character data from JSON files', () => {
      expect(characters).toBeDefined();
      expect(Array.isArray(characters)).toBe(true);
      expect(characters.length).toBeGreaterThan(1000); // Should have many characters
    });

    test('each character should have required properties', () => {
      characters.slice(0, 10).forEach(character => { // Test first 10 for performance
        expect(character).toHaveProperty('name');
        expect(character).toHaveProperty('slug');
        expect(character).toHaveProperty('totalAppearances');
        expect(character).toHaveProperty('totalBooks');
        expect(character).toHaveProperty('books');
        expect(character).toHaveProperty('appearances');

        expect(typeof character.name).toBe('string');
        expect(typeof character.slug).toBe('string');
        expect(typeof character.totalAppearances).toBe('number');
        expect(typeof character.totalBooks).toBe('number');
        expect(Array.isArray(character.books)).toBe(true);
        expect(Array.isArray(character.appearances)).toBe(true);

        expect(character.totalAppearances).toBeGreaterThan(0);
        expect(character.totalBooks).toBeGreaterThan(0);
      });
    });

    test('character slugs should be unique', () => {
      const slugs = characters.map(char => char.slug);
      const uniqueSlugs = [...new Set(slugs)];
      expect(slugs.length).toBe(uniqueSlugs.length);
    });

    test('characters should be sorted by appearance frequency', () => {
      // Test that characters are sorted in descending order by totalAppearances
      for (let i = 0; i < Math.min(characters.length - 1, 50); i++) {
        expect(characters[i].totalAppearances).toBeGreaterThanOrEqual(
          characters[i + 1].totalAppearances
        );
      }
    });

    test('character appearances should have required properties', () => {
      const testCharacter = characters[0]; // Test the most frequent character
      
      testCharacter.appearances.forEach(appearance => {
        expect(appearance).toHaveProperty('book');
        expect(appearance).toHaveProperty('chapter');
        expect(appearance).toHaveProperty('bookSlug');

        expect(typeof appearance.book).toBe('string');
        expect(typeof appearance.chapter).toBe('number');
        expect(typeof appearance.bookSlug).toBe('string');
        
        expect(appearance.chapter).toBeGreaterThan(0);
      });
    });
  });

  describe('Characters For Pages', () => {
    test('should filter to characters with 3+ appearances', () => {
      expect(charactersForPages).toBeDefined();
      expect(Array.isArray(charactersForPages)).toBe(true);
      
      charactersForPages.forEach(character => {
        expect(character.totalAppearances).toBeGreaterThanOrEqual(3);
      });
    });

    test('should be a subset of all characters', () => {
      expect(charactersForPages.length).toBeLessThan(characters.length);
      expect(charactersForPages.length).toBeGreaterThan(100); // Should still have many significant characters
    });
  });

  describe('Slug Generation', () => {
    // Test the createSlug function indirectly through character data
    test('should generate proper slugs for character names', () => {
      const testCases = characters.slice(0, 20); // Test first 20
      
      testCases.forEach(character => {
        expect(character.slug).toMatch(/^[a-z0-9-]+$/); // Only lowercase, numbers, hyphens
        expect(character.slug).not.toMatch(/^-|-$/); // No leading/trailing hyphens
        expect(character.slug).not.toMatch(/--+/); // No multiple consecutive hyphens
      });
    });

    test('should handle special characters in names', () => {
      // Look for characters that likely have special characters in source
      const specialCharacters = characters.filter(char => 
        char.name.includes('(') || char.name.includes(' ') || char.name.includes('/')
      );
      
      expect(specialCharacters.length).toBeGreaterThan(0);
      
      specialCharacters.slice(0, 5).forEach(character => {
        expect(character.slug).not.toMatch(/[^a-z0-9-]/); // Should not contain special chars
      });
    });
  });

  describe('Data Integrity', () => {
    test('most frequent characters should include major biblical figures', () => {
      const topCharacters = characters.slice(0, 20).map(char => char.name.toLowerCase());
      const expectedFigures = ['god', 'lord', 'jesus', 'moses', 'david', 'paul'];
      
      const foundFigures = expectedFigures.filter(figure => 
        topCharacters.some(name => name.includes(figure))
      );
      
      expect(foundFigures.length).toBeGreaterThan(3); // Should find most major figures
    });

    test('total appearances should match individual appearances length', () => {
      characters.slice(0, 10).forEach(character => {
        expect(character.totalAppearances).toBe(character.appearances.length);
      });
    });

    test('total books should match unique books in appearances', () => {
      characters.slice(0, 10).forEach(character => {
        const uniqueBooks = [...new Set(character.appearances.map(app => app.book))];
        expect(character.totalBooks).toBe(uniqueBooks.length);
      });
    });
  });
});