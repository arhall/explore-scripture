const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Build Tests', () => {
  const siteDir = path.join(__dirname, '..', '_site');

  beforeAll(() => {
    // Ensure we have a fresh build
    try {
      execSync('npm run build', {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe', // Suppress output during tests
        timeout: 30000, // 30 second timeout
      });
    } catch (error) {
      console.error('Build failed:', error.message);
      throw error;
    }
  }, 35000); // 35 second Jest timeout

  describe('Build Output', () => {
    test('should generate _site directory', () => {
      expect(fs.existsSync(siteDir)).toBe(true);
    });

    test('should generate main pages', () => {
      const requiredPages = [
        'index.html',
        'categories/index.html',
        'characters/index.html',
        'links/index.html',
      ];

      requiredPages.forEach(page => {
        const filePath = path.join(siteDir, page);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('should generate book pages', () => {
      const books = require('../src/_data/books.json');

      // Test a few sample books
      const sampleBooks = ['genesis', 'matthew', 'psalms', 'revelation'];

      sampleBooks.forEach(bookSlug => {
        const bookPath = path.join(siteDir, 'books', bookSlug, 'index.html');
        expect(fs.existsSync(bookPath)).toBe(true);
      });
    });

    test('should generate category pages', () => {
      const categories = require('../src/_data/categories.js');

      categories.forEach(category => {
        const categoryPath = path.join(siteDir, 'categories', category.slug, 'index.html');
        expect(fs.existsSync(categoryPath)).toBe(true);
      });
    });

    test('should copy static assets', () => {
      const assetFiles = ['styles.css', 'assets'];

      assetFiles.forEach(asset => {
        const assetPath = path.join(siteDir, asset);
        expect(fs.existsSync(assetPath)).toBe(true);
      });
    });
  });

  describe('Generated HTML Content', () => {
    test('homepage should contain all categories', () => {
      const homepageContent = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');
      const categories = require('../src/_data/categories.js');

      categories.forEach(category => {
        expect(homepageContent).toContain(category.name);
      });
    });

    test('book pages should have chapter summaries when available', () => {
      const books = require('../src/_data/books.json');
      const booksWithSummaries = books.filter(
        book => book.chapterSummaries && Object.keys(book.chapterSummaries).length > 0
      );

      expect(booksWithSummaries.length).toBeGreaterThan(0);

      // Test one book with summaries
      const testBook = booksWithSummaries[0];
      const bookContent = fs.readFileSync(
        path.join(siteDir, 'books', testBook.slug, 'index.html'),
        'utf8'
      );

      expect(bookContent).toContain('Chapter Summaries');
      expect(bookContent).toContain('Enduring Word');
    });

    test('category pages should only show books from that category', () => {
      // Test Law (Torah) category
      const categoryPath = path.join(siteDir, 'categories', 'law-torah', 'index.html');

      // First check if the file exists
      expect(fs.existsSync(categoryPath)).toBe(true);

      const categoryContent = fs.readFileSync(categoryPath, 'utf8');

      // Should contain Torah books
      const torahBooks = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'];
      torahBooks.forEach(bookName => {
        expect(categoryContent).toContain(bookName);
      });

      // Should NOT contain non-Torah books in the book grid section
      // Note: They might appear in search data, but not in the main book grid
      const bookGridMatch = categoryContent.match(/<div class="grid">(.*?)<\/div>/s);
      if (bookGridMatch) {
        const bookGridContent = bookGridMatch[1];
        expect(bookGridContent).not.toContain('>Joshua<');
        expect(bookGridContent).not.toContain('>Matthew<');
      }
    });

    test('character pages should exist for significant characters only', () => {
      const charactersDir = path.join(siteDir, 'characters');
      const characterDirs = fs
        .readdirSync(charactersDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      // Should have reasonable number of character pages (not too many)
      expect(characterDirs.length).toBeGreaterThan(200);
      expect(characterDirs.length).toBeLessThan(300);
    });
  });

  describe('URL Structure', () => {
    test('should generate proper URL structure', () => {
      const expectedStructure = [
        'books/genesis/index.html',
        'categories/law-torah/index.html',
        'characters/moses/index.html',
        'links/index.html',
      ];

      expectedStructure.forEach(filePath => {
        expect(fs.existsSync(path.join(siteDir, filePath))).toBe(true);
      });
    });

    test('should not generate excessive character pages', () => {
      const charactersDir = path.join(siteDir, 'characters');

      if (fs.existsSync(charactersDir)) {
        const items = fs.readdirSync(charactersDir, { withFileTypes: true });
        const directories = items.filter(item => item.isDirectory());

        // Should be reasonable number (filtered to 3+ appearances)
        expect(directories.length).toBeLessThan(500);
      }
    });
  });

  describe('Content Validation', () => {
    test('HTML files should be valid and complete', () => {
      const indexContent = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');

      expect(indexContent).toContain('<!doctype html>');
      expect(indexContent).toContain('<html');
      expect(indexContent).toContain('<head>');
      expect(indexContent).toContain('<body>');
      expect(indexContent).toContain('Bible Explorer');
      expect(indexContent).toContain('</html>');
    });

    test('should not contain unprocessed template syntax', () => {
      const indexContent = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');

      // Should not contain unprocessed Nunjucks template syntax (but compiled JS can have {{ in strings)
      expect(indexContent).not.toMatch(/\{\{\s*\w+/); // No unprocessed variables like {{ book.name }}
      expect(indexContent).not.toMatch(/\{\%\s*\w+/); // No unprocessed blocks like {% for %}
    });
  });
});
