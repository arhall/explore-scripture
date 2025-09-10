const fs = require('fs');
const path = require('path');

// Test data integrity and structure
describe('Bible Data Tests', () => {
  let books;
  let categories;

  beforeAll(() => {
    books = require('../src/_data/books.json');
    categories = require('../src/_data/categories.js');
  });

  describe('Books Data', () => {
    test('books.json should exist and contain valid JSON', () => {
      expect(books).toBeDefined();
      expect(Array.isArray(books)).toBe(true);
      expect(books.length).toBe(66); // 66 books in the Bible
    });

    test('each book should have required properties', () => {
      books.forEach(book => {
        expect(book).toHaveProperty('name');
        expect(book).toHaveProperty('slug');
        expect(book).toHaveProperty('testament');
        expect(book).toHaveProperty('category');
        expect(book).toHaveProperty('author');
        expect(book).toHaveProperty('language');
        expect(book).toHaveProperty('chapterSummaries');

        // Validate data types
        expect(typeof book.name).toBe('string');
        expect(typeof book.slug).toBe('string');
        expect(['Old Testament', 'New Testament']).toContain(book.testament);
        expect(typeof book.category).toBe('string');
        expect(typeof book.author).toBe('string');
        expect(['Hebrew', 'Hebrew/Aramaic', 'Greek']).toContain(book.language);
      });
    });

    test('book slugs should be unique and URL-safe', () => {
      const slugs = books.map(book => book.slug);
      const uniqueSlugs = [...new Set(slugs)];

      expect(slugs.length).toBe(uniqueSlugs.length);

      slugs.forEach(slug => {
        expect(slug).toMatch(/^[a-z0-9-]+$/); // Only lowercase, numbers, and hyphens
        expect(slug).not.toMatch(/^-|-$/); // No leading or trailing hyphens
      });
    });

    test('chapter summaries should be properly formatted', () => {
      const booksWithSummaries = books.filter(
        book => book.chapterSummaries && Object.keys(book.chapterSummaries).length > 0
      );

      expect(booksWithSummaries.length).toBeGreaterThan(0);

      booksWithSummaries.forEach(book => {
        const chapters = Object.keys(book.chapterSummaries);

        chapters.forEach(chapter => {
          expect(chapter).toMatch(/^\d+$/); // Chapter numbers should be numeric strings
          expect(typeof book.chapterSummaries[chapter]).toBe('string');
          expect(book.chapterSummaries[chapter].length).toBeGreaterThan(10); // Reasonable summary length
        });
      });
    });

    test('Old Testament should have 39 books', () => {
      const otBooks = books.filter(book => book.testament === 'Old Testament');
      expect(otBooks.length).toBe(39);
    });

    test('New Testament should have 27 books', () => {
      const ntBooks = books.filter(book => book.testament === 'New Testament');
      expect(ntBooks.length).toBe(27);
    });
  });

  describe('Categories Data', () => {
    test('should have 10 biblical categories', () => {
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBe(10);
    });

    test('each category should have required properties', () => {
      categories.forEach(category => {
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('slug');
        expect(category).toHaveProperty('testament');
        expect(category).toHaveProperty('description');
        expect(category).toHaveProperty('bookCount');

        expect(typeof category.name).toBe('string');
        expect(typeof category.slug).toBe('string');
        expect(['Old Testament', 'New Testament']).toContain(category.testament);
        expect(typeof category.description).toBe('string');
        expect(typeof category.bookCount).toBe('number');
        expect(category.bookCount).toBeGreaterThan(0);
      });
    });

    test('category book counts should match actual book counts', () => {
      categories.forEach(category => {
        const actualCount = books.filter(book => book.category === category.name).length;
        expect(category.bookCount).toBe(actualCount);
      });
    });

    test('all book categories should exist in categories list', () => {
      const bookCategories = [...new Set(books.map(book => book.category))];
      const categoryNames = categories.map(cat => cat.name);

      bookCategories.forEach(bookCategory => {
        expect(categoryNames).toContain(bookCategory);
      });
    });
  });

  describe('Data Consistency', () => {
    test('Law (Torah) should have exactly 5 books', () => {
      const lawBooks = books.filter(book => book.category === 'Law (Torah)');
      expect(lawBooks.length).toBe(5);

      const expectedBooks = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'];
      const actualBooks = lawBooks.map(book => book.name).sort();
      expect(actualBooks).toEqual(expectedBooks.sort());
    });

    test('Gospels should have exactly 4 books', () => {
      const gospels = books.filter(book => book.category === 'Gospels');
      expect(gospels.length).toBe(4);

      const expectedGospels = ['Matthew', 'Mark', 'Luke', 'John'];
      const actualGospels = gospels.map(book => book.name).sort();
      expect(actualGospels).toEqual(expectedGospels.sort());
    });

    test('Psalms should be in Poetry & Writings category', () => {
      const psalms = books.find(book => book.name === 'Psalms');
      expect(psalms).toBeDefined();
      expect(psalms.category).toBe('Poetry & Writings');
    });
  });
});
