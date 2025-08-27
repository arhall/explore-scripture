// Cross-references system for linking related passages and themes
// This creates a comprehensive network of biblical connections

module.exports = {
  // Book-level cross-references - major themes and connections
  bookReferences: {
    'genesis': {
      themes: ['creation', 'covenant', 'promise', 'fall', 'redemption'],
      references: [
        { book: 'matthew', chapter: '1', connection: 'genealogy', text: 'Abraham\'s promise fulfilled' },
        { book: 'romans', chapter: '4', connection: 'faith', text: 'Abraham\'s faith model' },
        { book: 'hebrews', chapter: '11', connection: 'faith', text: 'Hall of Faith examples' },
        { book: 'revelation', chapter: '21', connection: 'restoration', text: 'New creation' }
      ]
    },
    'matthew': {
      themes: ['messiah', 'kingdom', 'fulfillment', 'teaching'],
      references: [
        { book: 'genesis', chapter: '3', connection: 'prophecy', text: 'Seed promise fulfilled' },
        { book: 'isaiah', chapter: '53', connection: 'messiah', text: 'Suffering servant' },
        { book: 'mark', chapter: '1', connection: 'gospel', text: 'Parallel gospel account' },
        { book: 'luke', chapter: '1', connection: 'gospel', text: 'Birth narrative' }
      ]
    },
    'psalms': {
      themes: ['worship', 'prayer', 'messiah', 'covenant'],
      references: [
        { book: 'matthew', chapter: '27', connection: 'messianic', text: 'Crucifixion psalms quoted' },
        { book: 'romans', chapter: '3', connection: 'sin', text: 'Universal sinfulness' },
        { book: 'hebrews', chapter: '1', connection: 'messiah', text: 'Messianic psalms applied' }
      ]
    },
    'isaiah': {
      themes: ['messiah', 'judgment', 'salvation', 'servant'],
      references: [
        { book: 'matthew', chapter: '1', connection: 'prophecy', text: 'Virgin birth prophecy' },
        { book: 'luke', chapter: '4', connection: 'mission', text: 'Jesus\' mission declared' },
        { book: 'acts', chapter: '8', connection: 'gospel', text: 'Ethiopian eunuch passage' },
        { book: 'romans', chapter: '10', connection: 'salvation', text: 'How beautiful the feet' }
      ]
    },
    'romans': {
      themes: ['justification', 'faith', 'grace', 'law'],
      references: [
        { book: 'genesis', chapter: '15', connection: 'faith', text: 'Abraham\'s righteousness' },
        { book: 'psalms', chapter: '32', connection: 'forgiveness', text: 'Blessed is he whose sin is covered' },
        { book: 'galatians', chapter: '3', connection: 'justification', text: 'Parallel teaching on faith' }
      ]
    }
  },

  // Chapter-specific cross-references for key passages
  chapterReferences: {
    'genesis-1': [
      { book: 'john', chapter: '1', verse: '1-3', connection: 'Word as Creator', text: 'In the beginning was the Word' },
      { book: 'colossians', chapter: '1', verse: '16', connection: 'Christ as Creator', text: 'All things created through him' },
      { book: 'hebrews', chapter: '1', verse: '2', connection: 'Son as Creator', text: 'Through whom he made the universe' },
      { book: 'revelation', chapter: '4', verse: '11', connection: 'Creation worship', text: 'You created all things' }
    ],
    'genesis-3': [
      { book: 'romans', chapter: '5', verse: '12', connection: 'Sin enters world', text: 'Sin through one man' },
      { book: 'galatians', chapter: '3', verse: '15', connection: 'First promise', text: 'Promise to offspring' },
      { book: 'revelation', chapter: '20', verse: '2', connection: 'Satan defeated', text: 'Ancient serpent bound' }
    ],
    'genesis-12': [
      { book: 'galatians', chapter: '3', verse: '8', connection: 'Gospel preached', text: 'Scripture preached gospel to Abraham' },
      { book: 'romans', chapter: '4', verse: '16', connection: 'Promise by faith', text: 'Promise guaranteed to all offspring' },
      { book: 'hebrews', chapter: '11', verse: '8', connection: 'Faith example', text: 'By faith Abraham obeyed' }
    ],
    'psalms-22': [
      { book: 'matthew', chapter: '27', verse: '46', connection: 'Crucifixion', text: 'My God, why have you forsaken me' },
      { book: 'mark', chapter: '15', verse: '24', connection: 'Crucifixion details', text: 'They divided his garments' },
      { book: 'hebrews', chapter: '2', verse: '12', connection: 'Brotherhood', text: 'I will declare your name to my brothers' }
    ],
    'isaiah-53': [
      { book: 'matthew', chapter: '8', verse: '17', connection: 'Healing ministry', text: 'He took our illnesses' },
      { book: 'acts', chapter: '8', verse: '32', connection: 'Ethiopian eunuch', text: 'Like a lamb led to slaughter' },
      { book: '1-peter', chapter: '2', verse: '24', connection: 'Atonement', text: 'By his wounds you have been healed' }
    ],
    'matthew-5': [
      { book: 'luke', chapter: '6', verse: '20', connection: 'Parallel teaching', text: 'Blessed are you poor' },
      { book: 'james', chapter: '1', verse: '2', connection: 'Trials and joy', text: 'Consider it joy when you face trials' },
      { book: '1-peter', chapter: '3', verse: '14', connection: 'Suffering blessing', text: 'Blessed if you suffer for righteousness' }
    ],
    'john-3': [
      { book: 'romans', chapter: '10', verse: '9', connection: 'Salvation', text: 'If you confess with your mouth' },
      { book: 'ephesians', chapter: '2', verse: '8', connection: 'Grace salvation', text: 'By grace through faith' },
      { book: 'titus', chapter: '3', verse: '5', connection: 'New birth', text: 'Washing of regeneration' }
    ],
    'romans-8': [
      { book: 'galatians', chapter: '5', verse: '16', connection: 'Spirit vs flesh', text: 'Walk by the Spirit' },
      { book: 'ephesians', chapter: '1', verse: '13', connection: 'Holy Spirit seal', text: 'Sealed with promised Holy Spirit' },
      { book: '1-john', chapter: '3', verse: '1', connection: 'Children of God', text: 'See what kind of love the Father has given' }
    ]
  },

  // Thematic cross-references - connect passages by major biblical themes
  thematicReferences: {
    'covenant': [
      { book: 'genesis', chapter: '9', connection: 'Noah', text: 'Rainbow covenant' },
      { book: 'genesis', chapter: '15', connection: 'Abraham', text: 'Covenant of faith' },
      { book: 'exodus', chapter: '19', connection: 'Moses', text: 'Sinai covenant' },
      { book: '2-samuel', chapter: '7', connection: 'David', text: 'Eternal throne promise' },
      { book: 'jeremiah', chapter: '31', connection: 'New Covenant', text: 'New covenant promised' },
      { book: 'hebrews', chapter: '8', connection: 'Fulfillment', text: 'New covenant fulfilled' }
    ],
    'messiah': [
      { book: 'genesis', chapter: '3', verse: '15', connection: 'First promise', text: 'Seed of woman' },
      { book: 'psalms', chapter: '2', connection: 'Anointed King', text: 'You are my Son' },
      { book: 'isaiah', chapter: '7', verse: '14', connection: 'Virgin birth', text: 'Virgin shall conceive' },
      { book: 'isaiah', chapter: '9', verse: '6', connection: 'Divine child', text: 'Child is born, Son is given' },
      { book: 'daniel', chapter: '7', verse: '13', connection: 'Son of Man', text: 'Like a son of man' },
      { book: 'matthew', chapter: '1', connection: 'Fulfillment', text: 'Genealogy of Jesus Christ' }
    ],
    'salvation': [
      { book: 'genesis', chapter: '15', verse: '6', connection: 'Faith credited', text: 'Believed God, credited as righteousness' },
      { book: 'psalms', chapter: '32', verse: '1', connection: 'Forgiveness', text: 'Blessed whose sin is forgiven' },
      { book: 'isaiah', chapter: '55', verse: '7', connection: 'Call to repent', text: 'Let wicked forsake his way' },
      { book: 'john', chapter: '3', verse: '16', connection: 'God\'s love', text: 'For God so loved the world' },
      { book: 'romans', chapter: '3', verse: '23', connection: 'Universal need', text: 'All have sinned' },
      { book: 'ephesians', chapter: '2', verse: '8', connection: 'By grace', text: 'By grace through faith' }
    ],
    'resurrection': [
      { book: 'psalms', chapter: '16', verse: '10', connection: 'Prophecy', text: 'Will not abandon to Sheol' },
      { book: 'isaiah', chapter: '53', verse: '10', connection: 'After suffering', text: 'He will see his offspring' },
      { book: 'matthew', chapter: '28', connection: 'Historical event', text: 'He has risen' },
      { book: '1-corinthians', chapter: '15', connection: 'Significance', text: 'If Christ has not been raised' },
      { book: 'revelation', chapter: '1', verse: '18', connection: 'Victory', text: 'I died, and behold I am alive' }
    ],
    'second-coming': [
      { book: 'daniel', chapter: '7', verse: '13', connection: 'Vision', text: 'Coming with clouds of heaven' },
      { book: 'matthew', chapter: '24', verse: '30', connection: 'Jesus\' teaching', text: 'Sign of Son of Man in heaven' },
      { book: 'acts', chapter: '1', verse: '11', connection: 'Promise', text: 'Will come in same way' },
      { book: '1-thessalonians', chapter: '4', verse: '16', connection: 'Rapture', text: 'Lord himself will descend' },
      { book: 'revelation', chapter: '19', verse: '11', connection: 'Return as King', text: 'Rider on white horse' }
    ]
  },

  // Character connections - track how biblical figures connect across books
  characterReferences: {
    'abraham': [
      { book: 'genesis', chapters: ['12', '15', '17', '22'], role: 'Patriarch' },
      { book: 'romans', chapter: '4', role: 'Faith example' },
      { book: 'galatians', chapter: '3', role: 'Gospel recipient' },
      { book: 'hebrews', chapter: '11', role: 'Hall of faith' },
      { book: 'james', chapter: '2', role: 'Faith and works' }
    ],
    'david': [
      { book: '1-samuel', chapters: ['16', '17'], role: 'Anointed shepherd' },
      { book: '2-samuel', chapter: '7', role: 'Covenant recipient' },
      { book: 'psalms', chapters: ['23', '51'], role: 'Worship leader' },
      { book: 'matthew', chapter: '1', role: 'Messianic lineage' },
      { book: 'acts', chapter: '13', role: 'Man after God\'s heart' }
    ],
    'moses': [
      { book: 'exodus', chapters: ['3', '20'], role: 'Deliverer and lawgiver' },
      { book: 'deuteronomy', chapter: '18', role: 'Prophet like me' },
      { book: 'matthew', chapter: '17', role: 'Transfiguration witness' },
      { book: 'hebrews', chapter: '3', role: 'Faithful servant' },
      { book: 'revelation', chapter: '15', role: 'Song of Moses' }
    ]
  }
};