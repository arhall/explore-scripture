// Test Eleventy filters
describe('Eleventy Filters', () => {
  let eleventyConfig;
  let filters = {};

  beforeAll(() => {
    // Mock Eleventy config to capture filters
    eleventyConfig = {
      addFilter: jest.fn((name, fn) => {
        filters[name] = fn;
      }),
      addPlugin: jest.fn(),
      addPassthroughCopy: jest.fn(),
      addTransform: jest.fn(),
      setQuietMode: jest.fn(),
      setWatchThrottleWaitTime: jest.fn(),
    };

    // Load our Eleventy configuration to register filters
    const configFn = require('../.eleventy.js');
    configFn(eleventyConfig);
  });

  describe('chapterSort filter', () => {
    test('should sort chapters numerically in ascending order', () => {
      const chapters = {
        10: 'Chapter 10 summary',
        2: 'Chapter 2 summary',
        1: 'Chapter 1 summary',
        11: 'Chapter 11 summary',
      };

      const sorted = filters.chapterSort(chapters);
      const sortedChapters = sorted.map(([ch, summary]) => ch);

      expect(sortedChapters).toEqual(['1', '2', '10', '11']);
    });

    test('should handle empty or null input', () => {
      expect(filters.chapterSort(null)).toEqual([]);
      expect(filters.chapterSort(undefined)).toEqual([]);
      expect(filters.chapterSort({})).toEqual([]);
    });

    test('should preserve chapter summaries', () => {
      const chapters = {
        2: 'Second chapter',
        1: 'First chapter',
      };

      const sorted = filters.chapterSort(chapters);

      expect(sorted).toEqual([
        ['1', 'First chapter'],
        ['2', 'Second chapter'],
      ]);
    });
  });

  describe('commentaryUrl filter', () => {
    test('should generate correct URLs for regular books', () => {
      expect(filters.commentaryUrl('Genesis', '1')).toBe(
        'https://enduringword.com/bible-commentary/genesis-1/'
      );
      expect(filters.commentaryUrl('Matthew', '5')).toBe(
        'https://enduringword.com/bible-commentary/matthew-5/'
      );
      expect(filters.commentaryUrl('Revelation', '21')).toBe(
        'https://enduringword.com/bible-commentary/revelation-21/'
      );
    });

    test('should handle Psalms correctly (singular)', () => {
      expect(filters.commentaryUrl('Psalms', '23')).toBe(
        'https://enduringword.com/bible-commentary/psalm-23/'
      );
      expect(filters.commentaryUrl('Psalms', '119')).toBe(
        'https://enduringword.com/bible-commentary/psalm-119/'
      );
    });

    test('should handle numbered books correctly', () => {
      expect(filters.commentaryUrl('1 Samuel', '17')).toBe(
        'https://enduringword.com/bible-commentary/1-samuel-17/'
      );
      expect(filters.commentaryUrl('2 Kings', '2')).toBe(
        'https://enduringword.com/bible-commentary/2-kings-2/'
      );
      expect(filters.commentaryUrl('1 Corinthians', '13')).toBe(
        'https://enduringword.com/bible-commentary/1-corinthians-13/'
      );
    });

    test('should handle books with spaces', () => {
      expect(filters.commentaryUrl('Song of Songs', '1')).toBe(
        'https://enduringword.com/bible-commentary/song-of-songs-1/'
      );
    });
  });

  describe('slug filter', () => {
    test('should create URL-safe slugs', () => {
      expect(filters.slug('Hello World')).toBe('hello-world');
      expect(filters.slug('1 Samuel')).toBe('1-samuel');
      expect(filters.slug('Song of Songs')).toBe('song-of-songs');
    });

    test('should handle special characters', () => {
      expect(filters.slug('Test & Example')).toBe('test-example');
      expect(filters.slug('Multiple   Spaces')).toBe('multiple-spaces');
      expect(filters.slug('  Leading and Trailing  ')).toBe('leading-and-trailing');
    });

    test('should handle empty strings', () => {
      expect(filters.slug('')).toBe('');
      expect(filters.slug(null)).toBe('');
      expect(filters.slug(undefined)).toBe('');
    });
  });

  describe('unique filter', () => {
    test('should remove duplicates from array', () => {
      const input = ['a', 'b', 'a', 'c', 'b', 'd'];
      const expected = ['a', 'b', 'c', 'd'];
      expect(filters.unique(input)).toEqual(expected);
    });

    test('should handle empty array', () => {
      expect(filters.unique([])).toEqual([]);
    });
  });

  describe('limit filter', () => {
    test('should limit array to specified number of items', () => {
      const input = [1, 2, 3, 4, 5];
      expect(filters.limit(input, 3)).toEqual([1, 2, 3]);
    });

    test('should handle limit larger than array', () => {
      const input = [1, 2];
      expect(filters.limit(input, 5)).toEqual([1, 2]);
    });
  });

  describe('min filter', () => {
    test('should return minimum of two numbers', () => {
      expect(filters.min(5, 3)).toBe(3);
      expect(filters.min(10, 20)).toBe(10);
      expect(filters.min(-5, 5)).toBe(-5);
    });
  });

  describe('range filter', () => {
    test('should generate range of numbers', () => {
      expect(filters.range(0, 5)).toEqual([0, 1, 2, 3, 4]);
      expect(filters.range(2, 6)).toEqual([2, 3, 4, 5]);
    });

    test('should handle empty range', () => {
      expect(filters.range(5, 5)).toEqual([]);
      expect(filters.range(5, 3)).toEqual([]);
    });
  });
});
