const books = require('./books.json');

const categoriesData = [
  {
    name: 'Law (Torah)',
    slug: 'law-torah',
    testament: 'Old Testament',
    description: 'Genesis through Deuteronomy: creation, covenant, and the formation of Israel.',
    themes: ['Creation', 'Covenant', 'Law', 'Worship', 'Promise'],
    keyFigures: ['Adam', 'Noah', 'Abraham', 'Isaac', 'Jacob', 'Moses'],
    timeSpan: 'Creation to 1400 BC',
  },
  {
    name: 'History',
    slug: 'history',
    testament: 'Old Testament',
    description: 'Joshua through Esther: conquest, kingdom, exile, and return.',
    themes: ['Conquest', 'Kingdom', 'Exile', 'Return', 'Faithfulness'],
    keyFigures: ['Joshua', 'David', 'Solomon', 'Ezra', 'Nehemiah'],
    timeSpan: '1400-400 BC',
  },
  {
    name: 'Poetry & Writings',
    slug: 'poetry-writings',
    testament: 'Old Testament',
    description: 'Job through Song of Songs: wisdom, worship, and reflections.',
    themes: ['Wisdom', 'Worship', 'Suffering', 'Love', 'Meaning'],
    keyFigures: ['Job', 'David', 'Solomon'],
    timeSpan: 'Various periods',
  },
  {
    name: 'Major Prophets',
    slug: 'major-prophets',
    testament: 'Old Testament',
    description: 'Isaiah through Daniel: large prophetic works addressing judgment and hope.',
    themes: ['Judgment', 'Hope', 'Messiah', 'Restoration', 'Sovereignty'],
    keyFigures: ['Isaiah', 'Jeremiah', 'Ezekiel', 'Daniel'],
    timeSpan: '740-530 BC',
  },
  {
    name: 'Minor Prophets',
    slug: 'minor-prophets',
    testament: 'Old Testament',
    description: 'Hosea through Malachi: shorter prophetic books with powerful messages.',
    themes: ['Justice', 'Mercy', 'Repentance', 'Day of the Lord'],
    keyFigures: ['Hosea', 'Joel', 'Amos', 'Jonah', 'Micah'],
    timeSpan: '760-400 BC',
  },
  {
    name: 'Gospels',
    slug: 'gospels',
    testament: 'New Testament',
    description: 'Matthew, Mark, Luke, John: the life, death, and resurrection of Jesus.',
    themes: ['Kingdom', 'Salvation', 'Grace', 'Love', 'Truth'],
    keyFigures: ['Jesus', 'John the Baptist', 'Peter', 'Mary', 'Martha'],
    timeSpan: '4 BC - 30 AD',
  },
  {
    name: 'Acts',
    slug: 'acts',
    testament: 'New Testament',
    description: 'The birth and expansion of the early Church.',
    themes: ['Holy Spirit', 'Mission', 'Church Growth', 'Persecution'],
    keyFigures: ['Peter', 'Paul', 'Stephen', 'Philip', 'Barnabas'],
    timeSpan: '30-62 AD',
  },
  {
    name: 'Pauline Epistles',
    slug: 'pauline-epistles',
    testament: 'New Testament',
    description: 'Letters attributed to Paul addressing doctrine and church life.',
    themes: ['Justification', 'Sanctification', 'Unity', 'Leadership', 'Faith'],
    keyFigures: ['Paul', 'Timothy', 'Titus', 'Philemon'],
    timeSpan: '48-67 AD',
  },
  {
    name: 'General Epistles',
    slug: 'general-epistles',
    testament: 'New Testament',
    description: 'Letters by other apostles and leaders to the wider church.',
    themes: ['Perseverance', 'Love', 'Truth', 'Hope', 'Maturity'],
    keyFigures: ['Peter', 'John', 'James', 'Jude'],
    timeSpan: '45-90 AD',
  },
  {
    name: 'Apocalypse',
    slug: 'apocalypse',
    testament: 'New Testament',
    description: 'Revelation: apocalyptic prophecy and ultimate hope.',
    themes: ['Victory', 'Judgment', 'New Creation', 'Worship', 'Hope'],
    keyFigures: ['John', 'Jesus', 'The Lamb'],
    timeSpan: '95 AD',
  },
];

// Calculate book counts dynamically
const categoriesWithCounts = categoriesData.map(category => {
  const categoryBooks = books.filter(book => book.category === category.name);
  return {
    ...category,
    bookCount: categoryBooks.length,
  };
});

module.exports = categoriesWithCounts;
