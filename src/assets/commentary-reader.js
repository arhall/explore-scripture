/**
 * Commentary Reader - Full commentary reading experience in a modal window
 * Works alongside Chapter Reader for seamless Bible study
 */

class CommentaryReader {
  constructor() {
    this.commentaries = {
      // Iframe-compatible commentaries (sorted by popularity/usefulness)
      'enduring-word': { 
        name: 'Enduring Word (David Guzik)', 
        baseUrl: 'https://enduringword.com/bible-commentary',
        description: 'Clear, practical commentary with modern application',
        allowsIframe: true
      },
      'matthew-henry': { 
        name: 'Matthew Henry Commentary', 
        baseUrl: 'https://www.biblestudytools.com/commentaries/matthew-henry-complete',
        description: 'Classic devotional commentary',
        allowsIframe: true
      },
      'jfb': { 
        name: 'Jamieson-Fausset-Brown Commentary', 
        baseUrl: 'https://biblehub.com/commentaries/jfb',
        description: 'Scholarly verse-by-verse exposition',
        allowsIframe: true
      },
      'scofield': { 
        name: 'Scofield Reference Notes (1917)', 
        baseUrl: 'https://biblehub.com/commentaries/sco',
        description: 'Classic dispensational commentary with cross-references',
        allowsIframe: true
      },
      'pulpit': { 
        name: 'Pulpit Commentary', 
        baseUrl: 'https://biblehub.com/commentaries/pulpit',
        description: 'Homiletical and exegetical insights',
        allowsIframe: true
      },
      'john-gill': { 
        name: 'John Gill - Exposition of the Bible', 
        baseUrl: 'https://www.biblestudytools.com/commentaries/gills-exposition-of-the-bible',
        description: 'Detailed theological exposition',
        allowsIframe: true
      },
      
      // Direct access only (StudyLight blocks iframes)
      'barnes-notes': { 
        name: 'Barnes\' Notes', 
        baseUrl: 'https://www.studylight.org/commentaries/eng/bnb',
        description: 'Verse-by-verse commentary',
        allowsIframe: false // StudyLight blocks iframes
      },
      'calvin': { 
        name: 'Calvin\'s Bible Commentaries', 
        baseUrl: 'https://www.studylight.org/commentaries/eng/cal',
        description: 'Reformed theological perspective',
        allowsIframe: false // StudyLight blocks iframes
      },
      'homiletic': { 
        name: 'Preacher\'s Homiletic Commentary', 
        baseUrl: 'https://www.studylight.org/commentaries/eng/phc',
        description: 'Preaching and teaching resources',
        allowsIframe: false // StudyLight blocks iframes
      },
      'biblical-illustrator': { 
        name: 'The Biblical Illustrator (Exell)', 
        baseUrl: 'https://www.studylight.org/commentaries/eng/tbi',
        description: 'Illustrations and practical applications',
        allowsIframe: false // StudyLight blocks iframes
      }
    };

    // URL patterns will be defined in a method to access 'this' properly

    this.currentCommentary = localStorage.getItem('preferred-commentary') || 'enduring-word';
    this.currentModal = null;
    this.init();
  }

  init() {
    this.createStyles();
    this.initializeCommentaryButtons();
    this.setupKeyboardNavigation();
  }

  createStyles() {
    if (document.getElementById('commentary-reader-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'commentary-reader-styles';
    styles.textContent = `
      /* Commentary Reader Button */
      .commentary-reader-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--success, #10b981);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        margin-left: 0.5rem;
      }

      .commentary-reader-button:hover {
        background: var(--success-dark, #059669);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }

      .commentary-reader-button:active {
        transform: translateY(0);
      }

      .commentary-reader-icon {
        font-size: 1rem;
      }

      /* Chapter Actions Container */
      .chapter-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-top: 0.5rem;
        flex-wrap: wrap;
      }

      @media (max-width: 768px) {
        .chapter-actions {
          flex-direction: column;
          gap: 0.25rem;
          align-items: stretch;
        }
        
        .chapter-actions .chapter-reader-button,
        .chapter-actions .commentary-reader-button {
          width: 100%;
          justify-content: center;
        }
      }

      /* Modal Overlay - Inherits from chapter reader but with commentary-specific overrides */
      .commentary-reader-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
        backdrop-filter: blur(4px);
      }

      .commentary-reader-overlay.visible {
        opacity: 1;
        visibility: visible;
      }

      /* Modal Content */
      .commentary-reader-modal {
        background: var(--card, #ffffff);
        border-radius: 12px;
        width: 90vw;
        max-width: 1100px;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        transform: scale(0.9) translateY(20px);
        transition: transform 0.3s ease;
      }

      .commentary-reader-overlay.visible .commentary-reader-modal {
        transform: scale(1) translateY(0);
      }

      /* Modal Header */
      .commentary-reader-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 2rem;
        border-bottom: 1px solid var(--border, #e5e7eb);
        flex-shrink: 0;
      }

      .commentary-reader-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text, #111827);
        margin: 0;
      }

      .commentary-reader-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .commentary-reader-source-select {
        background: var(--bg-secondary, #f9fafb);
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 6px;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text, #111827);
        cursor: pointer;
        min-width: 250px;
        margin-right: 1rem;
      }
      
      .commentary-reader-source-select:focus {
        outline: 2px solid var(--success, #10b981);
        outline-offset: 1px;
        border-color: var(--success, #10b981);
      }

      .commentary-reader-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-secondary, #6b7280);
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s ease;
      }

      .commentary-reader-close:hover {
        background: var(--bg-secondary, #f9fafb);
        color: var(--text, #111827);
      }

      /* Modal Content Area */
      .commentary-reader-content {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .commentary-reader-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4rem;
        color: var(--text-secondary, #6b7280);
      }

      .commentary-reader-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid var(--border-light, #f3f4f6);
        border-top: 3px solid var(--success, #10b981);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 1rem;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Iframe Styles */
      .commentary-reader-iframe-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
        flex: 1;
      }

      .commentary-reader-iframe {
        width: 100%;
        height: 600px;
        min-height: 500px;
        border: none;
        border-radius: 8px;
        background: var(--bg-secondary, #f8fafc);
        flex: 1;
      }

      .commentary-reader-iframe-fallback {
        margin-top: 1rem;
        padding: 1rem;
        text-align: center;
        background: var(--bg-secondary, #f8fafc);
        border-radius: 8px;
        border: 1px solid var(--border, #e5e7eb);
      }

      .commentary-reader-iframe-fallback p {
        margin: 0 0 0.75rem 0;
        color: var(--text-secondary, #6b7280);
        font-size: 0.875rem;
      }

      .commentary-reader-external-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--success, #10b981);
        text-decoration: none;
        font-weight: 500;
        font-size: 0.875rem;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        background: var(--success-alpha-10, rgba(16, 185, 129, 0.1));
        border: 1px solid var(--success-alpha-20, rgba(16, 185, 129, 0.2));
        transition: all 0.2s ease;
      }

      .commentary-reader-external-link:hover {
        background: var(--success-alpha-20, rgba(16, 185, 129, 0.2));
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
        text-decoration: none;
      }

      /* Source Description */
      .commentary-source-description {
        padding: 0.75rem 2rem;
        background: var(--bg-secondary, #f8fafc);
        border-bottom: 1px solid var(--border, #e5e7eb);
        font-size: 0.875rem;
        color: var(--text-secondary, #6b7280);
        text-align: center;
        font-style: italic;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .commentary-reader-modal {
          width: 100vw;
          height: 100vh;
          max-height: 100vh;
          border-radius: 0;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .commentary-reader-header {
          padding: 1rem 1.5rem;
        }

        .commentary-reader-title {
          font-size: 1.25rem;
        }

        .commentary-reader-controls {
          gap: 0.5rem;
        }

        .commentary-reader-source-select {
          font-size: 0.8rem;
          padding: 0.4rem;
          min-width: 200px;
        }

        .commentary-reader-iframe {
          height: 100%;
          min-height: 400px;
        }

        .commentary-reader-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .commentary-reader-iframe-container {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .commentary-reader-iframe-fallback {
          display: none;
        }

        .commentary-source-description {
          padding: 0.5rem 1rem;
        }
      }

      /* Very small screens */
      @media (max-width: 480px) {
        .commentary-reader-header {
          padding: 0.75rem 1rem;
        }

        .commentary-reader-source-select {
          min-width: 180px;
          font-size: 0.75rem;
        }
      }

      /* Large desktop screens */
      @media (min-width: 1200px) {
        .commentary-reader-iframe {
          height: 700px;
          min-height: 600px;
        }
        
        .commentary-reader-modal {
          width: 85vw;
          max-width: 1200px;
        }
      }

      /* Dark Mode Support */
      @media (prefers-color-scheme: dark) {
        .commentary-reader-modal {
          background: var(--card-dark, #1f2937);
        }

        .commentary-reader-header {
          border-color: var(--border-dark, #374151);
        }

        .commentary-reader-title {
          color: var(--text-dark, #f9fafb);
        }

        .commentary-reader-source-select {
          background: var(--bg-secondary-dark, #111827);
          border-color: var(--border-dark, #374151);
          color: var(--text-dark, #f9fafb);
        }

        .commentary-reader-close:hover {
          background: var(--bg-secondary-dark, #111827);
        }

        .commentary-source-description {
          background: var(--bg-secondary-dark, #111827);
          border-color: var(--border-dark, #374151);
          color: var(--text-secondary-dark, #9ca3af);
        }
      }

      [data-theme="dark"] .commentary-reader-modal {
        background: var(--card-dark, #1f2937);
      }

      [data-theme="dark"] .commentary-reader-header {
        border-color: var(--border-dark, #374151);
      }

      [data-theme="dark"] .commentary-reader-title {
        color: var(--text-dark, #f9fafb);
      }

      [data-theme="dark"] .commentary-reader-source-select {
        background: var(--bg-secondary-dark, #111827);
        border-color: var(--border-dark, #374151);
        color: var(--text-dark, #f9fafb);
      }

      [data-theme="dark"] .commentary-reader-close:hover {
        background: var(--bg-secondary-dark, #111827);
      }

      [data-theme="dark"] .commentary-source-description {
        background: var(--bg-secondary-dark, #111827);
        border-color: var(--border-dark, #374151);
        color: var(--text-secondary-dark, #9ca3af);
      }

      /* Direct Access Interface Styles */
      .commentary-reader-direct-access {
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        min-height: 400px;
        justify-content: center;
      }

      .direct-access-header {
        margin-bottom: 2rem;
      }

      .blocked-iframe-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.7;
      }

      .direct-access-header h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text, #111827);
        margin: 0 0 0.5rem 0;
      }

      .direct-access-header p {
        color: var(--text-secondary, #6b7280);
        font-size: 0.95rem;
        margin: 0;
        max-width: 500px;
      }

      .direct-access-content {
        width: 100%;
        max-width: 600px;
      }

      .commentary-preview {
        background: var(--bg-secondary, #f9fafb);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2rem;
        text-align: left;
      }

      .commentary-preview h4 {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text, #111827);
        margin: 0 0 0.75rem 0;
      }

      .commentary-preview > p {
        color: var(--text-secondary, #6b7280);
        font-size: 0.9rem;
        margin: 0 0 1.5rem 0;
        line-height: 1.5;
      }

      .access-instructions h5 {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--text, #111827);
        margin: 0 0 0.75rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .access-instructions ol {
        margin: 0;
        padding-left: 1.5rem;
        color: var(--text-secondary, #6b7280);
        font-size: 0.9rem;
        line-height: 1.6;
      }

      .access-instructions li {
        margin-bottom: 0.5rem;
      }

      .direct-access-actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;
      }

      .commentary-reader-primary-link {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
        background: var(--success, #10b981);
        color: white;
        text-decoration: none;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        min-width: 280px;
        justify-content: center;
      }

      .commentary-reader-primary-link:hover {
        background: var(--success-dark, #059669);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
        text-decoration: none;
      }

      .link-icon {
        font-size: 1.1rem;
      }

      .external-indicator {
        font-size: 0.9rem;
        opacity: 0.8;
      }

      .alternative-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .copy-link-btn,
      .switch-commentary-btn {
        background: var(--bg-secondary, #f9fafb);
        border: 1px solid var(--border, #e5e7eb);
        color: var(--text, #111827);
        padding: 0.6rem 1.2rem;
        border-radius: 8px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .copy-link-btn:hover,
      .switch-commentary-btn:hover {
        background: var(--bg-tertiary, #ffffff);
        border-color: var(--accent, #2563eb);
        color: var(--accent, #2563eb);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
      }

      /* Mobile responsiveness for direct access */
      @media (max-width: 768px) {
        .commentary-reader-direct-access {
          padding: 1.5rem;
          min-height: 300px;
        }

        .blocked-iframe-icon {
          font-size: 2.5rem;
        }

        .direct-access-header h3 {
          font-size: 1.25rem;
        }

        .commentary-preview {
          padding: 1.25rem;
        }

        .commentary-reader-primary-link {
          min-width: 100%;
          padding: 0.875rem 1.5rem;
        }

        .alternative-actions {
          flex-direction: column;
          width: 100%;
        }

        .copy-link-btn,
        .switch-commentary-btn {
          width: 100%;
        }
      }

      /* Dark mode for direct access */
      @media (prefers-color-scheme: dark) {
        .direct-access-header h3 {
          color: var(--text-dark, #f9fafb);
        }

        .commentary-preview {
          background: var(--bg-secondary-dark, #111827);
        }

        .commentary-preview h4 {
          color: var(--text-dark, #f9fafb);
        }

        .access-instructions h5 {
          color: var(--text-dark, #f9fafb);
        }

        .copy-link-btn,
        .switch-commentary-btn {
          background: var(--bg-secondary-dark, #111827);
          border-color: var(--border-dark, #374151);
          color: var(--text-dark, #f9fafb);
        }

        .copy-link-btn:hover,
        .switch-commentary-btn:hover {
          background: var(--bg-tertiary-dark, #1f2937);
          border-color: var(--accent, #3b82f6);
          color: var(--accent, #3b82f6);
        }
      }

      [data-theme="dark"] .direct-access-header h3 {
        color: var(--text-dark, #f9fafb);
      }

      [data-theme="dark"] .commentary-preview {
        background: var(--bg-secondary-dark, #111827);
      }

      [data-theme="dark"] .commentary-preview h4 {
        color: var(--text-dark, #f9fafb);
      }

      [data-theme="dark"] .access-instructions h5 {
        color: var(--text-dark, #f9fafb);
      }

      [data-theme="dark"] .copy-link-btn,
      [data-theme="dark"] .switch-commentary-btn {
        background: var(--bg-secondary-dark, #111827);
        border-color: var(--border-dark, #374151);
        color: var(--text-dark, #f9fafb);
      }

      [data-theme="dark"] .copy-link-btn:hover,
      [data-theme="dark"] .switch-commentary-btn:hover {
        background: var(--bg-tertiary-dark, #1f2937);
        border-color: var(--accent, #3b82f6);
        color: var(--accent, #3b82f6);
      }
    `;
    document.head.appendChild(styles);
  }

  initializeCommentaryButtons() {
    // Find all existing Enduring Word commentary links and add commentary reader buttons
    const commentaryLinks = document.querySelectorAll('a[href*="enduringword.com"]');
    const processedChapters = new Set();
    
    commentaryLinks.forEach(link => {
      const url = link.href;
      const chapterInfo = this.extractChapterInfo(url);
      
      if (chapterInfo) {
        const chapterKey = `${chapterInfo.book}-${chapterInfo.chapter}`;
        
        // Only add button if we haven't processed this chapter yet
        if (!processedChapters.has(chapterKey)) {
          this.addCommentaryReaderButton(link, chapterInfo);
          processedChapters.add(chapterKey);
        }
      }
    });
  }

  extractChapterInfo(url) {
    // Extract book and chapter from Enduring Word URL
    // Format: https://enduringword.com/bible-commentary/book-chapter/
    const match = url.match(/bible-commentary\/([^-]+)-(\d+)/);
    if (match) {
      const [, bookSlug, chapter] = match;
      const bookName = this.convertSlugToBookName(bookSlug);
      return {
        book: bookName,
        chapter: parseInt(chapter, 10),
        reference: `${bookName} ${chapter}`
      };
    }
    return null;
  }

  convertSlugToBookName(slug) {
    // Convert URL slug back to proper book name
    const bookMap = {
      'genesis': 'Genesis',
      'exodus': 'Exodus',
      'leviticus': 'Leviticus',
      'numbers': 'Numbers',
      'deuteronomy': 'Deuteronomy',
      'joshua': 'Joshua',
      'judges': 'Judges',
      'ruth': 'Ruth',
      '1-samuel': '1 Samuel',
      '2-samuel': '2 Samuel',
      '1-kings': '1 Kings',
      '2-kings': '2 Kings',
      '1-chronicles': '1 Chronicles',
      '2-chronicles': '2 Chronicles',
      'ezra': 'Ezra',
      'nehemiah': 'Nehemiah',
      'esther': 'Esther',
      'job': 'Job',
      'psalm': 'Psalms',
      'proverbs': 'Proverbs',
      'ecclesiastes': 'Ecclesiastes',
      'song-of-songs': 'Song of Songs',
      'isaiah': 'Isaiah',
      'jeremiah': 'Jeremiah',
      'lamentations': 'Lamentations',
      'ezekiel': 'Ezekiel',
      'daniel': 'Daniel',
      'hosea': 'Hosea',
      'joel': 'Joel',
      'amos': 'Amos',
      'obadiah': 'Obadiah',
      'jonah': 'Jonah',
      'micah': 'Micah',
      'nahum': 'Nahum',
      'habakkuk': 'Habakkuk',
      'zephaniah': 'Zephaniah',
      'haggai': 'Haggai',
      'zechariah': 'Zechariah',
      'malachi': 'Malachi',
      'matthew': 'Matthew',
      'mark': 'Mark',
      'luke': 'Luke',
      'john': 'John',
      'acts': 'Acts',
      'romans': 'Romans',
      '1-corinthians': '1 Corinthians',
      '2-corinthians': '2 Corinthians',
      'galatians': 'Galatians',
      'ephesians': 'Ephesians',
      'philippians': 'Philippians',
      'colossians': 'Colossians',
      '1-thessalonians': '1 Thessalonians',
      '2-thessalonians': '2 Thessalonians',
      '1-timothy': '1 Timothy',
      '2-timothy': '2 Timothy',
      'titus': 'Titus',
      'philemon': 'Philemon',
      'hebrews': 'Hebrews',
      'james': 'James',
      '1-peter': '1 Peter',
      '2-peter': '2 Peter',
      '1-john': '1 John',
      '2-john': '2 John',
      '3-john': '3 John',
      'jude': 'Jude',
      'revelation': 'Revelation'
    };
    
    return bookMap[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  slugifyBook(bookName) {
    // Convert book name to URL slug format
    const reverseMap = {
      'Genesis': 'genesis',
      'Exodus': 'exodus',
      'Leviticus': 'leviticus',
      'Numbers': 'numbers',
      'Deuteronomy': 'deuteronomy',
      'Joshua': 'joshua',
      'Judges': 'judges',
      'Ruth': 'ruth',
      '1 Samuel': '1-samuel',
      '2 Samuel': '2-samuel',
      '1 Kings': '1-kings',
      '2 Kings': '2-kings',
      '1 Chronicles': '1-chronicles',
      '2 Chronicles': '2-chronicles',
      'Ezra': 'ezra',
      'Nehemiah': 'nehemiah',
      'Esther': 'esther',
      'Job': 'job',
      'Psalms': 'psalm',
      'Proverbs': 'proverbs',
      'Ecclesiastes': 'ecclesiastes',
      'Song of Songs': 'song-of-songs',
      'Isaiah': 'isaiah',
      'Jeremiah': 'jeremiah',
      'Lamentations': 'lamentations',
      'Ezekiel': 'ezekiel',
      'Daniel': 'daniel',
      'Hosea': 'hosea',
      'Joel': 'joel',
      'Amos': 'amos',
      'Obadiah': 'obadiah',
      'Jonah': 'jonah',
      'Micah': 'micah',
      'Nahum': 'nahum',
      'Habakkuk': 'habakkuk',
      'Zephaniah': 'zephaniah',
      'Haggai': 'haggai',
      'Zechariah': 'zechariah',
      'Malachi': 'malachi',
      'Matthew': 'matthew',
      'Mark': 'mark',
      'Luke': 'luke',
      'John': 'john',
      'Acts': 'acts',
      'Romans': 'romans',
      '1 Corinthians': '1-corinthians',
      '2 Corinthians': '2-corinthians',
      'Galatians': 'galatians',
      'Ephesians': 'ephesians',
      'Philippians': 'philippians',
      'Colossians': 'colossians',
      '1 Thessalonians': '1-thessalonians',
      '2 Thessalonians': '2-thessalonians',
      '1 Timothy': '1-timothy',
      '2 Timothy': '2-timothy',
      'Titus': 'titus',
      'Philemon': 'philemon',
      'Hebrews': 'hebrews',
      'James': 'james',
      '1 Peter': '1-peter',
      '2 Peter': '2-peter',
      '1 John': '1-john',
      '2 John': '2-john',
      '3 John': '3-john',
      'Jude': 'jude',
      'Revelation': 'revelation'
    };
    
    return reverseMap[bookName] || bookName.toLowerCase().replace(/\s+/g, '-');
  }

  addCommentaryReaderButton(existingCommentaryLink, chapterInfo) {
    // Create both Read Chapter and Read Commentary buttons
    const wrapper = document.createElement('div');
    wrapper.className = 'chapter-actions';
    wrapper.style.cssText = 'display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem;';
    
    // Create Read Chapter button
    const chapterButton = document.createElement('button');
    chapterButton.className = 'chapter-reader-button';
    chapterButton.innerHTML = `<span>Read Chapter</span>`;
    chapterButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.chapterReaderInstance) {
        window.chapterReaderInstance.openChapterReader(chapterInfo);
      }
    });
    
    // Create Read Commentary button
    const commentaryButton = document.createElement('button');
    commentaryButton.className = 'commentary-reader-button';
    commentaryButton.innerHTML = `<span>Read Commentary</span>`;
    commentaryButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.openCommentaryReader(chapterInfo);
    });
    
    // Add both buttons to wrapper
    wrapper.appendChild(chapterButton);
    wrapper.appendChild(commentaryButton);
    
    // Replace the existing link with our button wrapper
    existingCommentaryLink.parentNode.replaceChild(wrapper, existingCommentaryLink);
  }

  async openCommentaryReader(chapterInfo) {
    // Close any existing modal
    if (this.currentModal) {
      this.closeCommentaryReader();
    }

    // Create modal
    const modal = this.createModal(chapterInfo);
    document.body.appendChild(modal);
    this.currentModal = modal;

    // Show modal with animation
    setTimeout(() => {
      modal.classList.add('visible');
    }, 50);

    // Track analytics
    if (window.telemetry) {
      window.telemetry.recordUserAction('commentary-reader-open', chapterInfo.reference);
    }
  }

  createModal(chapterInfo) {
    const overlay = document.createElement('div');
    overlay.className = 'commentary-reader-overlay';
    
    const currentCommentaryInfo = this.commentaries[this.currentCommentary];
    
    overlay.innerHTML = `
      <div class="commentary-reader-modal">
        <div class="commentary-reader-header">
          <h2 class="commentary-reader-title">${chapterInfo.reference} Commentary</h2>
          <div class="commentary-reader-controls">
            <select class="commentary-reader-source-select" aria-label="Select commentary source">
              ${Object.entries(this.commentaries).map(([key, info]) => 
                `<option value="${key}" ${key === this.currentCommentary ? 'selected' : ''}>${info.name}</option>`
              ).join('')}
            </select>
            <button class="commentary-reader-close" aria-label="Close commentary reader">&times;</button>
          </div>
        </div>
        <div class="commentary-source-description">
          ${currentCommentaryInfo.description}
        </div>
        <div class="commentary-reader-content">
          ${this.renderCommentaryIframe(chapterInfo)}
        </div>
      </div>
    `;

    // Event listeners
    const closeBtn = overlay.querySelector('.commentary-reader-close');
    closeBtn.addEventListener('click', () => this.closeCommentaryReader());

    // Commentary source selector change
    const sourceSelect = overlay.querySelector('.commentary-reader-source-select');
    sourceSelect.addEventListener('change', (e) => {
      this.currentCommentary = e.target.value;
      localStorage.setItem('preferred-commentary', this.currentCommentary);
      
      // Update the commentary content and description
      this.updateCommentaryContent(overlay, chapterInfo);
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeCommentaryReader();
      }
    });

    return overlay;
  }

  updateCommentaryContent(overlay, chapterInfo) {
    // Update the iframe with new commentary source
    const contentDiv = overlay.querySelector('.commentary-reader-content');
    contentDiv.innerHTML = this.renderCommentaryIframe(chapterInfo);
    
    // Update the description
    const descriptionDiv = overlay.querySelector('.commentary-source-description');
    descriptionDiv.textContent = this.commentaries[this.currentCommentary].description;
  }

  closeCommentaryReader() {
    if (this.currentModal) {
      this.currentModal.classList.remove('visible');
      setTimeout(() => {
        if (this.currentModal && this.currentModal.parentNode) {
          this.currentModal.parentNode.removeChild(this.currentModal);
        }
        this.currentModal = null;
      }, 300);
    }
  }

  getCommentaryUrl(chapterInfo) {
    const source = this.currentCommentary;
    const book = chapterInfo.book;
    const chapter = chapterInfo.chapter;
    const baseUrl = this.commentaries[source].baseUrl;
    const bookName = this.getBookNameForSource(book, source);
    
    // Build URL based on commentary source format
    switch (source) {
      case 'enduring-word':
        return `${baseUrl}/${bookName}-${chapter}`;
        
      case 'matthew-henry':
        return `${baseUrl}/${bookName}/${chapter}.html`;
        
      case 'jfb':
      case 'scofield':
      case 'pulpit':
        return `${baseUrl}/${bookName}/${chapter}.htm`;
        
      case 'john-gill':
        return `${baseUrl}/${bookName}-${chapter}/`;
        
      case 'barnes-notes':
      case 'calvin':
      case 'homiletic':
      case 'biblical-illustrator':
        return `${baseUrl}/${bookName}-${chapter}.html`;
        
      default:
        // Fallback to enduring word format
        return `${this.commentaries['enduring-word'].baseUrl}/${this.getBookNameForSource(book, 'enduring-word')}-${chapter}`;
    }
  }

  // Get book name formatted for specific commentary sources
  getBookNameForSource(bookName, source) {
    switch (source) {
      case 'enduring-word':
        // Enduring Word uses hyphenated format: genesis-1, 1-john-1
        return this.slugifyBook(bookName);
        
      case 'matthew-henry':
      case 'john-gill':
        // BibleStudyTools uses hyphenated format: genesis, 1-corinthians
        return this.slugifyBook(bookName);
        
      case 'jfb':
      case 'scofield': 
      case 'pulpit':
        // BibleHub uses lowercase with no spaces: genesis, 1john
        return bookName.toLowerCase().replace(/\s+/g, '');
        
      case 'barnes-notes':
      case 'calvin':
      case 'homiletic':
      case 'biblical-illustrator':
        // StudyLight uses hyphenated format: genesis, 1-john
        return this.slugifyBook(bookName);
        
      default:
        return this.slugifyBook(bookName);
    }
  }

  renderCommentaryIframe(chapterInfo) {
    const url = this.getCommentaryUrl(chapterInfo);
    const commentaryInfo = this.commentaries[this.currentCommentary];
    
    // Check if this commentary allows iframe embedding
    if (commentaryInfo.allowsIframe) {
      return `
        <div class="commentary-reader-iframe-container">
          <iframe 
            src="${url}" 
            class="commentary-reader-iframe"
            title="${chapterInfo.reference} - ${commentaryInfo.name}"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerpolicy="no-referrer-when-downgrade"
            onload="this.style.opacity='1'"
            onerror="this.nextElementSibling.style.display='block'; this.style.display='none';">
          </iframe>
          <div class="commentary-reader-iframe-fallback" style="display: none;">
            <p>Unable to load commentary in frame</p>
            <a href="${url}" target="_blank" class="commentary-reader-external-link">
              ⧉ Open ${chapterInfo.reference} Commentary
            </a>
          </div>
        </div>
      `;
    } else {
      // For sites that block iframes, show a direct access interface
      return `
        <div class="commentary-reader-direct-access">
          <div class="direct-access-header">
            <div class="blocked-iframe-icon">🚫</div>
            <h3>Direct Access Required</h3>
            <p>${commentaryInfo.name} doesn't allow embedding in frames for security reasons.</p>
          </div>
          
          <div class="direct-access-content">
            <div class="commentary-preview">
              <h4>About ${commentaryInfo.name}:</h4>
              <p>${commentaryInfo.description}</p>
              
              <div class="access-instructions">
                <h5>📖 How to access this commentary:</h5>
                <ol>
                  <li>Click the button below to open the commentary in a new tab</li>
                  <li>Navigate to ${chapterInfo.reference} if not automatically loaded</li>
                  <li>Use your browser's back button to return here when done</li>
                </ol>
              </div>
            </div>
            
            <div class="direct-access-actions">
              <a href="${url}" target="_blank" class="commentary-reader-primary-link">
                <span class="link-icon">🔗</span>
                Open ${chapterInfo.reference} Commentary
                <span class="external-indicator">↗</span>
              </a>
              
              <div class="alternative-actions">
                <button onclick="navigator.clipboard?.writeText('${url}').then(() => { 
                  this.textContent = '✓ Copied!'; 
                  setTimeout(() => this.textContent = 'Copy Link', 2000); 
                })" class="copy-link-btn">
                  Copy Link
                </button>
                
                <button onclick="window.commentaryReaderInstance.switchToWorkingCommentary()" class="switch-commentary-btn">
                  Try Different Commentary
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  switchToWorkingCommentary() {
    // Switch to a commentary that allows iframe embedding
    const workingCommentaries = Object.keys(this.commentaries).filter(
      key => this.commentaries[key].allowsIframe && key !== this.currentCommentary
    );
    
    if (workingCommentaries.length > 0) {
      // Prefer Enduring Word first, then others
      const newCommentary = workingCommentaries.includes('enduring-word') 
        ? 'enduring-word' 
        : workingCommentaries[0];
      
      // Update the select dropdown
      const sourceSelect = this.currentModal?.querySelector('.commentary-reader-source-select');
      if (sourceSelect) {
        sourceSelect.value = newCommentary;
        this.currentCommentary = newCommentary;
        localStorage.setItem('preferred-commentary', newCommentary);
        
        // Trigger the change event to update content
        sourceSelect.dispatchEvent(new Event('change'));
      }
    }
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (this.currentModal) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.closeCommentaryReader();
        }
      }
    });
  }

  // Public API for manual usage
  static openCommentary(book, chapter, source = null) {
    if (!window.commentaryReaderInstance) {
      window.commentaryReaderInstance = new CommentaryReader();
    }
    
    if (source && window.commentaryReaderInstance.commentaries[source]) {
      window.commentaryReaderInstance.currentCommentary = source;
      localStorage.setItem('preferred-commentary', source);
    }
    
    const chapterInfo = {
      book: book,
      chapter: chapter,
      reference: `${book} ${chapter}`
    };
    
    window.commentaryReaderInstance.openCommentaryReader(chapterInfo);
  }
}

// Initialize when DOM is ready OR immediately if DOM is already ready
function initializeCommentaryReader() {
  if (!window.commentaryReaderInstance) {
    window.commentaryReaderInstance = new CommentaryReader();
    console.log('[CommentaryReader] Initialized and commentary buttons added');
  }
}

// Check if DOM is already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCommentaryReader);
} else {
  // DOM is already ready, initialize immediately
  initializeCommentaryReader();
}

// Also listen for custom events from module loader
document.addEventListener('commentaryReaderLoaded', initializeCommentaryReader);

// Global function for use in onclick handlers
function openCommentaryReader(reference, book, chapter) {
  if (!window.commentaryReaderInstance) {
    window.commentaryReaderInstance = new CommentaryReader();
  }
  
  const chapterInfo = {
    book: book,
    chapter: chapter,
    reference: reference
  };
  
  window.commentaryReaderInstance.openCommentaryReader(chapterInfo);
}

// Make it available globally
window.openCommentaryReader = openCommentaryReader;
window.CommentaryReader = CommentaryReader;