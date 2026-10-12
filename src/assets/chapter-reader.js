/**
 * Chapter Reader - Full chapter reading experience in a modal window
 * Works alongside Scripture Widget for seamless Bible study
 */

/* global SecurityConfig */

class ChapterReader {
  constructor() {
    this.translations = {
      esv: { name: 'English Standard Version', api: 'esv' },
      niv: { name: 'New International Version', api: 'niv' },
      nlt: { name: 'New Living Translation', api: 'nlt' },
      nkjv: { name: 'New King James Version', api: 'nkjv' },
      nasb: { name: 'New American Standard Bible', api: 'nasb' },
      ampc: { name: 'Amplified Bible, Classic Edition', api: 'ampc' },
      web: { name: 'World English Bible', api: 'web' },
    };

    // API Keys - loaded securely from config
    this.apiKeys = this.loadApiKeys();

    // The chapter reader now uses the global theme system

    this.apiSources = [
      {
        name: 'esv-api',
        endpoint: 'https://api.esv.org/v3/passage/text/',
        format: this.formatEsvApiResponse.bind(this),
        translations: ['esv'],
      },
      {
        name: 'bible-api',
        endpoint: 'https://bible-api.com/',
        format: this.formatBibleApiResponse.bind(this),
        translations: ['web'], // Default for bible-api.com
      },
    ];

    this.cache = new Map();
    this.currentTranslation =
      localStorage.getItem('preferred-chapter-translation') ||
      localStorage.getItem('preferred-translation') ||
      'web';
    if (!this.translations[this.currentTranslation]) this.currentTranslation = 'web';
    this.currentModal = null;
    this.keydownHandler = null;
    this.init();
  }

  init() {
    this.createStyles();
    this.initializeChapterButtons();
    this.setupKeyboardNavigation();
    const params = new URLSearchParams(window.location.search);
    if (params.get('reader') === 'chapter' && window.location.pathname.startsWith('/books/')) {
      const chapter = Number(params.get('chapter'));
      const book = document.querySelector('h1')?.textContent?.trim();
      if (book && Number.isInteger(chapter) && chapter > 0 && chapter <= this.getBookChapterCount(book)) {
        this.openChapterReader({ book, chapter, reference: `${book} ${chapter}` });
      }
    }
  }

  createStyles() {
    if (document.getElementById('chapter-reader-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'chapter-reader-styles';
    styles.textContent = `
      /* Chapter Reader Button */
      .chapter-reader-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--accent, #2563eb);
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

      .chapter-reader-button:hover {
        background: var(--accent-dark, #1e40af);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      }

      .chapter-reader-button:active {
        transform: translateY(0);
      }

      .chapter-reader-icon {
        font-size: 1rem;
      }

      /* Modal Overlay */
      .chapter-reader-overlay {
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

      .chapter-reader-overlay.visible {
        opacity: 1;
        visibility: visible;
      }

      /* Modal Content */
      .chapter-reader-modal {
        background: var(--card, #ffffff);
        border-radius: 12px;
        width: 90vw;
        max-width: 900px;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        transform: scale(0.9) translateY(20px);
        transition: transform 0.3s ease;
      }

      .chapter-reader-overlay.visible .chapter-reader-modal {
        transform: scale(1) translateY(0);
      }

      /* Modal Header */
      .chapter-reader-header {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.5rem 2rem;
        border-bottom: 1px solid var(--border, #e5e7eb);
        flex-shrink: 0;
      }

      .chapter-reader-nav-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .chapter-reader-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text, #111827);
        margin: 0;
        flex: 1;
        text-align: center;
      }

      .chapter-count {
        font-size: 0.9rem;
        font-weight: 400;
        color: var(--text-secondary, #6b7280);
      }

      .chapter-nav-btn {
        background: var(--accent, #2563eb);
        color: white;
        border: none;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .chapter-nav-btn:hover {
        background: var(--accent-hover, #1d4ed8);
        transform: translateY(-1px);
      }

      .chapter-nav-btn:active {
        transform: translateY(0);
      }

      .chapter-nav-placeholder {
        width: 60px;
        height: 36px;
      }

      .chapter-reader-controls {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 1rem;
      }

      .chapter-reader-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .chapter-reader-translation-select {
        background: var(--bg-secondary, #f9fafb);
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 6px;
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text, #111827);
        cursor: pointer;
        min-width: 200px;
        margin-right: 1rem;
      }
      
      .chapter-reader-translation-select:focus {
        outline: 2px solid var(--accent, #3b82f6);
        outline-offset: 1px;
        border-color: var(--accent, #3b82f6);
      }

      .chapter-reader-close {
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

      .chapter-reader-close:hover {
        background: var(--bg-secondary, #f9fafb);
        color: var(--text, #111827);
      }

      /* Modal Content Area */
      .chapter-reader-content {
        flex: 1;
        overflow-y: auto;
        padding: 2rem;
        line-height: 1.7;
      }

      .chapter-reader-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4rem;
        color: var(--text-secondary, #6b7280);
      }

      .chapter-reader-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid var(--border-light, #f3f4f6);
        border-top: 3px solid var(--accent, #2563eb);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 1rem;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .chapter-reader-error {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--error, #dc2626);
      }

      .chapter-reader-error h3 {
        margin: 0 0 1rem 0;
        color: var(--error, #dc2626);
      }

      .chapter-reader-retry {
        background: var(--accent, #2563eb);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        margin-top: 1rem;
      }

      /* Chapter Text Styling */
      .chapter-reader-verses {
        font-size: 1.1rem;
        line-height: 1.8;
        color: var(--text, #111827);
      }

      .chapter-reader-verse {
        margin-bottom: 0.75rem;
      }

      .chapter-verse-number {
        display: inline-block;
        background: var(--accent, #2563eb);
        color: white;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        margin-right: 0.75rem;
        min-width: 1.5rem;
        text-align: center;
        vertical-align: top;
      }

      .chapter-verse-text {
        display: inline;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .chapter-reader-modal {
          width: 95vw;
          max-height: 90vh;
          border-radius: 12px 12px 0 0;
          margin-top: auto;
        }

        .chapter-reader-header {
          padding: 1rem 1.5rem;
        }

        .chapter-reader-title {
          font-size: 1.25rem;
        }

        .chapter-reader-content {
          padding: 1.5rem;
        }

        .chapter-reader-controls {
          gap: 0.5rem;
        }

        .chapter-nav-btn {
          font-size: 0.8rem;
          padding: 0.4rem 0.6rem;
        }

        .chapter-reader-title {
          font-size: 1.1rem;
        }

        .chapter-count {
          font-size: 0.8rem;
        }

        .chapter-reader-translation-select {
          font-size: 0.8rem;
          padding: 0.4rem;
        }
      }

      /* Dark Mode Support */
      @media (prefers-color-scheme: dark) {
        .chapter-reader-modal {
          background: var(--card-dark, #1f2937);
        }

        .chapter-reader-header {
          border-color: var(--border-dark, #374151);
        }

        .chapter-reader-title {
          color: var(--text-dark, #f9fafb);
        }

        .chapter-reader-translation-select {
          background: var(--bg-secondary-dark, #111827);
          border-color: var(--border-dark, #374151);
          color: var(--text-dark, #f9fafb);
        }

        .chapter-reader-close:hover {
          background: var(--bg-secondary-dark, #111827);
        }

        .chapter-reader-verses {
          color: var(--text-dark, #f9fafb);
        }
      }

      [data-theme="dark"] .chapter-reader-modal {
        background: var(--card-dark, #1f2937);
      }

      [data-theme="dark"] .chapter-reader-header {
        border-color: var(--border-dark, #374151);
      }

      [data-theme="dark"] .chapter-reader-title {
        color: var(--text-dark, #f9fafb);
      }

      [data-theme="dark"] .chapter-reader-translation-select {
        background: var(--bg-secondary-dark, #111827);
        border-color: var(--border-dark, #374151);
        color: var(--text-dark, #f9fafb);
      }

      [data-theme="dark"] .chapter-reader-close:hover {
        background: var(--bg-secondary-dark, #111827);
      }

      [data-theme="dark"] .chapter-reader-verses {
        color: var(--text-dark, #f9fafb);
      }

      /* Fast Content Layout */
      .chapter-reader-fast-content {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .chapter-reader-header-links {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 0 1rem 0;
        border-bottom: 1px solid var(--border, #e5e7eb);
        margin-bottom: 1rem;
      }

      .translation-badge {
        background: var(--accent, #2563eb);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .chapter-reader-external-links {
        display: flex;
        gap: 0.5rem;
      }

      .biblegateway-link,
      .cross-references-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s ease;
        cursor: pointer;
      }

      .biblegateway-link {
        background: var(--success, #10b981);
        color: white;
      }

      .biblegateway-link:hover {
        background: var(--success-dark, #059669);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }

      .cross-references-btn {
        background: var(--warning, #f59e0b);
        color: white;
        border: none;
      }

      .cross-references-btn:hover {
        background: var(--warning-dark, #d97706);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
      }

      .chapter-reader-footer {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border, #e5e7eb);
        text-align: center;
      }

      .chapter-reader-note {
        color: var(--text-secondary, #6b7280);
        font-size: 0.875rem;
        margin: 0;
      }

      .chapter-reader-note a {
        color: var(--accent, #2563eb);
        text-decoration: none;
      }

      .chapter-reader-note a:hover {
        text-decoration: underline;
      }

      /* Commentary Link Integration */
      .commentary-links {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }

      .enduring-word-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: var(--success, #10b981);
        color: white;
        text-decoration: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .enduring-word-link:hover {
        background: var(--success-dark, #059669);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      }

      .enduring-word-icon {
        font-size: 1rem;
      }

      /* Iframe Styles */
      .chapter-reader-iframe-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        position: relative;
      }

      .chapter-reader-iframe {
        width: 100%;
        height: 600px;
        min-height: 400px;
        border: none;
        border-radius: 8px;
        background: var(--bg-secondary, #f8fafc);
        flex: 1;
      }

      .chapter-reader-iframe-fallback {
        margin-top: 1rem;
        padding: 1rem;
        text-align: center;
        background: var(--bg-secondary, #f8fafc);
        border-radius: 8px;
        border: 1px solid var(--border, #e5e7eb);
      }

      .chapter-reader-iframe-fallback p {
        margin: 0 0 0.75rem 0;
        color: var(--text-secondary, #6b7280);
        font-size: 0.875rem;
      }

      .chapter-reader-external-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--accent, #2563eb);
        text-decoration: none;
        font-weight: 500;
        font-size: 0.875rem;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        background: var(--accent-alpha-10, rgba(37, 99, 235, 0.1));
        border: 1px solid var(--accent-alpha-20, rgba(37, 99, 235, 0.2));
        transition: all 0.2s ease;
      }

      .chapter-reader-external-link:hover {
        background: var(--accent-alpha-20, rgba(37, 99, 235, 0.2));
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        text-decoration: none;
      }

      /* Mobile optimizations */
      @media (max-width: 768px) {
        .chapter-reader-external-link {
          display: none !important;
        }
        
        .chapter-reader-controls {
          justify-content: space-between;
        }
        
        .chapter-reader-translation-select {
          margin-right: 0.5rem;
          min-width: 160px;
          flex: 1;
          max-width: 200px;
        }
      }

      /* Mobile View Toggle Styles */
      .mobile-view-toggle {
        display: flex;
        background: var(--bg-secondary, #f9fafb);
        border-radius: 8px;
        padding: 2px;
        margin-bottom: 0.75rem;
      }

      .toggle-btn {
        flex: 1;
        background: transparent;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-secondary, #6b7280);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .toggle-btn.active {
        background: var(--accent, #2563eb);
        color: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .toggle-btn:hover:not(.active) {
        background: var(--bg-tertiary, #ffffff);
        color: var(--text, #111827);
      }

      .iframe-view-container,
      .api-view-container {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .loading-api-content {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 300px;
        color: var(--text-secondary, #6b7280);
        font-size: 0.875rem;
      }

      /* Mobile Iframe Adjustments */
      @media (max-width: 768px) {
        .chapter-reader-iframe {
          height: 70vh;
          min-height: 400px;
        }
        
        .chapter-reader-modal {
          height: 95vh;
          width: 100vw;
          border-radius: 0;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          max-height: 100vh;
        }
        
        .chapter-reader-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          padding: 1rem;
        }
        
        .chapter-reader-iframe-container {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        /* Hide fallback on mobile to save space */
        .chapter-reader-iframe-fallback {
          display: none;
        }
      }

      /* Very small screens */
      @media (max-width: 480px) {
        .chapter-reader-iframe {
          height: 75vh;
          min-height: 450px;
        }
        
        .chapter-reader-header {
          padding: 0.75rem 1rem;
        }
        
        .chapter-reader-content {
          padding: 0.5rem;
        }
      }

      /* Large desktop screens */
      @media (min-width: 1200px) {
        .chapter-reader-iframe {
          height: 700px;
          min-height: 500px;
        }
        
        .chapter-reader-modal {
          width: 80vw;
          max-width: 1000px;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  initializeChapterButtons() {
    console.log('[ChapterReader] Starting button initialization...');

    // If commentary reader is loaded OR if chapter-actions divs exist, skip to avoid duplication
    if (window.commentaryReaderInstance || document.querySelector('.chapter-actions')) {
      console.log(
        '[ChapterReader] Commentary reader system detected, skipping button initialization to avoid duplication'
      );
      return;
    }

    // Check if buttons have already been initialized by any system
    if (
      document.querySelector('.chapter-reader-button') ||
      document.querySelector('.commentary-reader-button')
    ) {
      console.log('[ChapterReader] Reader buttons already exist, skipping initialization');
      return;
    }

    // Wait a bit to see if commentary reader initializes first
    setTimeout(() => {
      // Double-check after delay
      if (
        window.commentaryReaderInstance ||
        document.querySelector('.chapter-actions') ||
        document.querySelector('.chapter-reader-button') ||
        document.querySelector('.commentary-reader-button')
      ) {
        console.log('[ChapterReader] Commentary reader system initialized first, skipping');
        return;
      }

      this.proceedWithButtonInitialization();
    }, 100);
  }

  proceedWithButtonInitialization() {
    // Find all Enduring Word commentary links and add chapter reader buttons
    const commentaryLinks = document.querySelectorAll('a[href*="enduringword.com"]');
    console.log(`[ChapterReader] Found ${commentaryLinks.length} Enduring Word links`);
    const processedChapters = new Set();

    commentaryLinks.forEach(link => {
      const url = link.href;
      const chapterInfo = this.extractChapterInfo(url);

      if (chapterInfo) {
        const chapterKey = `${chapterInfo.book}-${chapterInfo.chapter}`;

        // Only add button if we haven't processed this chapter yet
        if (!processedChapters.has(chapterKey)) {
          this.addChapterReaderButton(link, chapterInfo);
          processedChapters.add(chapterKey);
        } else {
          // If this is a duplicate, just style it as commentary link
          link.className = 'enduring-word-link';
          link.innerHTML = `
            <span>Commentary</span>
          `;
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
        reference: `${bookName} ${chapter}`,
      };
    }
    return null;
  }

  convertSlugToBookName(slug) {
    // Convert URL slug back to proper book name
    const bookMap = {
      genesis: 'Genesis',
      exodus: 'Exodus',
      leviticus: 'Leviticus',
      numbers: 'Numbers',
      deuteronomy: 'Deuteronomy',
      joshua: 'Joshua',
      judges: 'Judges',
      ruth: 'Ruth',
      '1-samuel': '1 Samuel',
      '2-samuel': '2 Samuel',
      '1-kings': '1 Kings',
      '2-kings': '2 Kings',
      '1-chronicles': '1 Chronicles',
      '2-chronicles': '2 Chronicles',
      ezra: 'Ezra',
      nehemiah: 'Nehemiah',
      esther: 'Esther',
      job: 'Job',
      psalm: 'Psalms',
      proverbs: 'Proverbs',
      ecclesiastes: 'Ecclesiastes',
      'song-of-songs': 'Song of Songs',
      isaiah: 'Isaiah',
      jeremiah: 'Jeremiah',
      lamentations: 'Lamentations',
      ezekiel: 'Ezekiel',
      daniel: 'Daniel',
      hosea: 'Hosea',
      joel: 'Joel',
      amos: 'Amos',
      obadiah: 'Obadiah',
      jonah: 'Jonah',
      micah: 'Micah',
      nahum: 'Nahum',
      habakkuk: 'Habakkuk',
      zephaniah: 'Zephaniah',
      haggai: 'Haggai',
      zechariah: 'Zechariah',
      malachi: 'Malachi',
      matthew: 'Matthew',
      mark: 'Mark',
      luke: 'Luke',
      john: 'John',
      acts: 'Acts',
      romans: 'Romans',
      '1-corinthians': '1 Corinthians',
      '2-corinthians': '2 Corinthians',
      galatians: 'Galatians',
      ephesians: 'Ephesians',
      philippians: 'Philippians',
      colossians: 'Colossians',
      '1-thessalonians': '1 Thessalonians',
      '2-thessalonians': '2 Thessalonians',
      '1-timothy': '1 Timothy',
      '2-timothy': '2 Timothy',
      titus: 'Titus',
      philemon: 'Philemon',
      hebrews: 'Hebrews',
      james: 'James',
      '1-peter': '1 Peter',
      '2-peter': '2 Peter',
      '1-john': '1 John',
      '2-john': '2 John',
      '3-john': '3 John',
      jude: 'Jude',
      revelation: 'Revelation',
    };

    return bookMap[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getBookChapterCount(bookName) {
    // Number of chapters in each book of the Bible
    const chapterCounts = {
      Genesis: 50,
      Exodus: 40,
      Leviticus: 27,
      Numbers: 36,
      Deuteronomy: 34,
      Joshua: 24,
      Judges: 21,
      Ruth: 4,
      '1 Samuel': 31,
      '2 Samuel': 24,
      '1 Kings': 22,
      '2 Kings': 25,
      '1 Chronicles': 29,
      '2 Chronicles': 36,
      Ezra: 10,
      Nehemiah: 13,
      Esther: 10,
      Job: 42,
      Psalms: 150,
      Proverbs: 31,
      Ecclesiastes: 12,
      'Song of Songs': 8,
      Isaiah: 66,
      Jeremiah: 52,
      Lamentations: 5,
      Ezekiel: 48,
      Daniel: 12,
      Hosea: 14,
      Joel: 3,
      Amos: 9,
      Obadiah: 1,
      Jonah: 4,
      Micah: 7,
      Nahum: 3,
      Habakkuk: 3,
      Zephaniah: 3,
      Haggai: 2,
      Zechariah: 14,
      Malachi: 4,
      Matthew: 28,
      Mark: 16,
      Luke: 24,
      John: 21,
      Acts: 28,
      Romans: 16,
      '1 Corinthians': 16,
      '2 Corinthians': 13,
      Galatians: 6,
      Ephesians: 6,
      Philippians: 4,
      Colossians: 4,
      '1 Thessalonians': 5,
      '2 Thessalonians': 3,
      '1 Timothy': 6,
      '2 Timothy': 4,
      Titus: 3,
      Philemon: 1,
      Hebrews: 13,
      James: 5,
      '1 Peter': 5,
      '2 Peter': 3,
      '1 John': 5,
      '2 John': 1,
      '3 John': 1,
      Jude: 1,
      Revelation: 22,
    };
    return chapterCounts[bookName] || 1;
  }

  getNavigationInfo(chapterInfo) {
    const { book, chapter } = chapterInfo;
    const totalChapters = this.getBookChapterCount(book);

    const prevChapter = chapter > 1 ? chapter - 1 : null;
    const nextChapter = chapter < totalChapters ? chapter + 1 : null;

    return {
      prevChapter: prevChapter
        ? { book, chapter: prevChapter, reference: `${book} ${prevChapter}` }
        : null,
      nextChapter: nextChapter
        ? { book, chapter: nextChapter, reference: `${book} ${nextChapter}` }
        : null,
      currentChapter: chapter,
      totalChapters,
    };
  }

  addChapterReaderButton(commentaryLink, chapterInfo) {
    console.log(
      `[ChapterReader] Processing link for ${chapterInfo.book} ${chapterInfo.chapter}`,
      commentaryLink
    );

    // Skip if this link is already processed (has a wrapper parent or commentary reader buttons)
    if (
      commentaryLink.parentNode &&
      (commentaryLink.parentNode.classList.contains('commentary-links') ||
        commentaryLink.parentNode.classList.contains('chapter-actions') ||
        commentaryLink.parentNode.querySelector('.commentary-reader-button'))
    ) {
      console.log(
        `[ChapterReader] Skipping ${chapterInfo.book} ${chapterInfo.chapter} - already processed by commentary reader`
      );
      return;
    }

    // Also check if there's already a chapter reader button for this specific chapter
    const existingButton = commentaryLink.parentNode.querySelector('.chapter-reader-button');
    if (existingButton) {
      console.log(
        `[ChapterReader] Skipping ${chapterInfo.book} ${chapterInfo.chapter} - button already exists`
      );
      return;
    }

    console.log(`[ChapterReader] Adding button for ${chapterInfo.book} ${chapterInfo.chapter}`);

    // Create wrapper for both links
    const wrapper = document.createElement('div');
    wrapper.className = 'commentary-links';

    // Update commentary link styling
    commentaryLink.className = 'enduring-word-link';
    commentaryLink.innerHTML = `
      <span>Commentary</span>
    `;

    // Create chapter reader button
    const readerButton = document.createElement('button');
    readerButton.className = 'chapter-reader-button';
    readerButton.innerHTML = `
      <span>Read Chapter</span>
    `;

    readerButton.addEventListener('click', e => {
      e.preventDefault();
      this.openChapterReader(chapterInfo);
    });

    // Insert wrapper before commentary link, then move links into wrapper
    commentaryLink.parentNode.insertBefore(wrapper, commentaryLink);
    // Put Read Chapter button first, then Commentary link
    wrapper.appendChild(readerButton);
    wrapper.appendChild(commentaryLink);
  }

  async openChapterReader(chapterInfo) {
    // Close any existing modal
    if (this.currentModal) {
      this.closeChapterReader();
    }

    // Create modal
    const modal = this.createModal(chapterInfo);
    this.returnFocus = document.activeElement;
    document.body.appendChild(modal);
    this.currentModal = modal;
    modal.showModal();
    modal.querySelector('.chapter-reader-close').focus();
    this.setReaderUrl(chapterInfo);
    this.updateChapterContent(modal, chapterInfo);

    // Show modal with animation
    setTimeout(() => {
      modal.classList.add('visible');
    }, 50);

    // Track analytics
    if (window.telemetry) {
      window.telemetry.recordUserAction('chapter-reader-open', chapterInfo.reference);
    }
  }

  createModal(chapterInfo) {
    const overlay = document.createElement('dialog');
    overlay.className = 'chapter-reader-overlay';
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'chapter-reader-title');

    const bibleGatewayUrl = this.getBibleGatewayUrl(chapterInfo);
    const navInfo = this.getNavigationInfo(chapterInfo);

    overlay.innerHTML = `
      <div class="chapter-reader-modal">
        <div class="chapter-reader-header">
          <div class="chapter-reader-nav-section">
            ${
              navInfo.prevChapter
                ? `<button class="chapter-nav-btn prev" data-chapter="${navInfo.prevChapter.chapter}" title="Previous chapter">← ${navInfo.prevChapter.chapter}</button>`
                : '<span class="chapter-nav-placeholder"></span>'
            }
            <h2 class="chapter-reader-title" id="chapter-reader-title" tabindex="-1">${chapterInfo.reference} <span class="chapter-count">(${navInfo.currentChapter}/${navInfo.totalChapters})</span></h2>
            ${
              navInfo.nextChapter
                ? `<button class="chapter-nav-btn next" data-chapter="${navInfo.nextChapter.chapter}" title="Next chapter">${navInfo.nextChapter.chapter} →</button>`
                : '<span class="chapter-nav-placeholder"></span>'
            }
          </div>
          <div class="chapter-reader-controls">
            <select class="chapter-reader-translation-select" aria-label="Select Bible translation">
              ${Object.entries(this.translations)
                .map(
                  ([key, trans]) =>
                    `<option value="${key}" ${key === this.currentTranslation ? 'selected' : ''}>${trans.name} (${key === 'web' ? 'in app' : 'Bible Gateway'})</option>`
                )
                .join('')}
            </select>
            <a href="${bibleGatewayUrl}" target="_blank" class="chapter-reader-external-link" title="Open in new tab">
              Read on Bible Gateway (new tab)
            </a>
            <button class="reader-copy-link" type="button">Copy chapter link</button>
            <button class="chapter-reader-close" aria-label="Close chapter reader">&times;</button>
          </div>
        </div>
        <div class="chapter-reader-content">
          <p class="chapter-reader-loading" role="status">Loading chapter…</p>
        </div>
      </div>
    `;

    // Event listeners
    const closeBtn = overlay.querySelector('.chapter-reader-close');
    closeBtn.addEventListener('click', () => this.closeChapterReader());
    overlay.querySelector('.reader-copy-link').addEventListener('click', async e => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        e.currentTarget.textContent = 'Link copied';
      } catch {
        e.currentTarget.textContent = 'Copy the URL from your address bar';
      }
    });
    overlay.addEventListener('cancel', e => { e.preventDefault(); this.closeChapterReader(); });

    // Translation selector change
    const translationSelect = overlay.querySelector('.chapter-reader-translation-select');
    translationSelect.addEventListener('change', e => {
      this.currentTranslation = e.target.value;
      localStorage.setItem('preferred-chapter-translation', this.currentTranslation);
      localStorage.setItem('preferred-translation', this.currentTranslation);

      // Update the iframe and external link
      this.updateChapterContent(overlay, chapterInfo);
    });

    // Chapter navigation buttons
    const navBtns = overlay.querySelectorAll('.chapter-nav-btn');
    navBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        const targetChapter = parseInt(e.currentTarget.dataset.chapter, 10);
        const newChapterInfo = {
          book: chapterInfo.book,
          chapter: targetChapter,
          reference: `${chapterInfo.book} ${targetChapter}`,
        };

        // Update current modal in place instead of closing and reopening
        this.navigateToChapter(overlay, newChapterInfo);

        // Track navigation
        if (window.telemetry) {
          window.telemetry.recordUserAction(
            'chapter-navigation',
            `${chapterInfo.book} ${chapterInfo.chapter} → ${targetChapter}`
          );
        }
      });
    });

    // Close on overlay click
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        this.closeChapterReader();
      }
    });

    return overlay;
  }

  updateChapterContent(overlay, chapterInfo) {
    const contentDiv = overlay.querySelector('.chapter-reader-content');
    if (this.currentTranslation === 'web') {
      this.loadChapterContent(overlay, chapterInfo);
    } else {
      contentDiv.innerHTML = `<div class="chapter-reader-direct-access"><p>${this.translations[this.currentTranslation].name} is available on Bible Gateway. It opens in a new tab.</p><a href="${this.escapeHtml(this.getBibleGatewayUrl(chapterInfo))}" target="_blank" rel="noopener">Read ${this.escapeHtml(chapterInfo.reference)} on Bible Gateway (new tab)</a></div>`;
    }

    // Update the external link with new translation
    const externalLink = overlay.querySelector('.chapter-reader-external-link');
    externalLink.href = this.getBibleGatewayUrl(chapterInfo);
  }

  navigateToChapter(overlay, newChapterInfo) {
    // Update the header title and navigation buttons
    const navInfo = this.getNavigationInfo(newChapterInfo);

    // Update title
    const title = overlay.querySelector('.chapter-reader-title');
    if (title) {
      title.innerHTML = `${this.escapeHtml(newChapterInfo.reference)} <span class="chapter-count">(${navInfo.currentChapter}/${navInfo.totalChapters})</span>`;
    }

    // Update navigation buttons
    const navSection = overlay.querySelector('.chapter-reader-nav-section');
    if (navSection) {
      navSection.innerHTML = `
        ${
          navInfo.prevChapter
            ? `<button class="chapter-nav-btn prev" data-chapter="${navInfo.prevChapter.chapter}" title="Previous chapter">← ${navInfo.prevChapter.chapter}</button>`
            : '<span class="chapter-nav-placeholder"></span>'
        }
        <h2 class="chapter-reader-title" id="chapter-reader-title" tabindex="-1">${newChapterInfo.reference} <span class="chapter-count">(${navInfo.currentChapter}/${navInfo.totalChapters})</span></h2>
        ${
          navInfo.nextChapter
            ? `<button class="chapter-nav-btn next" data-chapter="${navInfo.nextChapter.chapter}" title="Next chapter">${navInfo.nextChapter.chapter} →</button>`
            : '<span class="chapter-nav-placeholder"></span>'
        }
      `;

      // Re-attach navigation event listeners
      const newNavBtns = navSection.querySelectorAll('.chapter-nav-btn');
      newNavBtns.forEach(btn => {
        btn.addEventListener('click', e => {
          const targetChapter = parseInt(e.currentTarget.dataset.chapter, 10);
          const nextChapterInfo = {
            book: newChapterInfo.book,
            chapter: targetChapter,
            reference: `${newChapterInfo.book} ${targetChapter}`,
          };

          // Recursive navigation
          this.navigateToChapter(overlay, nextChapterInfo);

          // Track navigation
          if (window.telemetry) {
            window.telemetry.recordUserAction(
              'chapter-navigation',
              `${newChapterInfo.book} ${newChapterInfo.chapter} → ${targetChapter}`
            );
          }
        });
      });
    }

    // Update content with new chapter
    this.updateChapterContent(overlay, newChapterInfo);
    this.setReaderUrl(newChapterInfo);
    navSection.querySelector('.chapter-reader-title')?.focus();

    // Update external link in header controls
    const headerExternalLink = overlay.querySelector(
      '.chapter-reader-controls .chapter-reader-external-link'
    );
    if (headerExternalLink) {
      headerExternalLink.href = this.getBibleGatewayUrl(newChapterInfo);
    }
  }

  closeChapterReader() {
    if (this.currentModal) {
      const modal = this.currentModal;
      modal.classList.remove('visible');
      modal.close();
      this.currentModal = null;
      this.clearReaderUrl();
      this.returnFocus?.focus();

      // Clean up keyboard navigation handler
      if (this.keydownHandler) {
        document.removeEventListener('keydown', this.keydownHandler);
        this.keydownHandler = null;
      }

      modal.remove();
    }
  }

  setReaderUrl(chapterInfo) {
    const url = new URL(window.location.href);
    url.searchParams.set('reader', 'chapter');
    url.searchParams.set('chapter', chapterInfo.chapter);
    url.searchParams.delete('source');
    window.history.replaceState(null, '', url);
  }

  clearReaderUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete('reader');
    url.searchParams.delete('chapter');
    window.history.replaceState(null, '', url);
  }

  async loadChapterContent(modal, chapterInfo) {
    const contentDiv = modal.querySelector('.chapter-reader-content');

    // Show loading state
    contentDiv.innerHTML = `
      <div class="chapter-reader-loading">
        <div class="chapter-reader-spinner"></div>
        <span>Loading ${chapterInfo.reference} (${this.translations[this.currentTranslation].name})...</span>
      </div>
    `;

    try {
      const cacheKey = `${this.escapeHtml(chapterInfo.reference)}-${this.currentTranslation}`;
      let chapterData = this.cache.get(cacheKey);

      if (!chapterData) {
        chapterData = await this.fetchChapter(chapterInfo.reference, this.currentTranslation);
        this.cache.set(cacheKey, chapterData);
      }

      if (this.currentModal === modal && this.currentTranslation === 'web') contentDiv.innerHTML = this.renderChapterContent(chapterData, chapterInfo);
    } catch (error) {
      console.error('Error loading chapter:', error);
      if (this.currentModal !== modal) return;
      contentDiv.innerHTML = `
        <div class="chapter-reader-error">
          <h3>Unable to Load Chapter</h3>
          <p>We're having trouble loading ${chapterInfo.reference}. This might be due to a network issue or API limitation.</p>
          <button class="chapter-reader-retry" onclick="window.chapterReaderInstance.loadChapterContent(this.closest('.chapter-reader-overlay'), ${JSON.stringify(chapterInfo)})">
            Try Again
          </button>
        </div>
      `;
    }
  }

  async fetchChapter(reference, translation = 'web') {
    if (translation !== 'web') throw new Error('This translation opens on Bible Gateway');
    const data = await this.fetchFromSource(this.apiSources.find(source => source.name === 'bible-api'), reference, 'web');
    if (!data) throw new Error('World English Bible could not be loaded');
    return data;
  }

  // Security: Rate limiting for API calls
  rateLimiter = {
    requests: new Map(),
    maxRequests: 10,
    timeWindow: 60000, // 1 minute

    checkRate(source) {
      const now = Date.now();
      const sourceRequests = this.requests.get(source) || [];

      // Remove old requests outside time window
      const validRequests = sourceRequests.filter(time => now - time < this.timeWindow);

      if (validRequests.length >= this.maxRequests) {
        return false; // Rate limit exceeded
      }

      validRequests.push(now);
      this.requests.set(source, validRequests);
      return true;
    },
  };

  // Security: Validate and sanitize API parameters
  sanitizeApiParams(reference, translation) {
    // Whitelist allowed characters for biblical references
    const cleanReference = reference.replace(/[^a-zA-Z0-9\s:-]/g, '');
    const cleanTranslation = translation.replace(/[^a-zA-Z]/g, '').toLowerCase();

    // Validate reference format
    if (!/^[a-zA-Z0-9\s]+\s*\d+(\s*:\s*\d+(-\d+)?)?$/.test(cleanReference)) {
      throw new Error('Invalid reference format');
    }

    // Validate translation code
    if (!['esv', 'niv', 'nlt', 'nkjv', 'nasb', 'ampc', 'web'].includes(cleanTranslation)) {
      throw new Error('Invalid translation code');
    }

    return { cleanReference, cleanTranslation };
  }

  async fetchFromSource(source, reference, translation) {
    // Security: Input validation
    let cleanReference, cleanTranslation;
    try {
      ({ cleanReference, cleanTranslation } = this.sanitizeApiParams(reference, translation));
    } catch (error) {
      console.error('Invalid API parameters:', error);
      return null;
    }

    // Security: Rate limiting
    if (!this.rateLimiter.checkRate(source.name)) {
      console.warn(`Rate limit exceeded for ${source.name}`);
      return null;
    }

    if (source.name === 'esv-api' && cleanTranslation === 'esv') {
      // ESV API format with sanitized parameters
      const formattedRef = encodeURIComponent(cleanReference.replace(/\s+/g, '+').toLowerCase());

      try {
        // Security: Timeout and signal for fetch
         
        const controller =
          typeof AbortController !== 'undefined'
            ? new AbortController()
            : { signal: null, abort: () => {} };
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(
          `${source.endpoint}?q=${formattedRef}&include-verse-numbers=true&include-headings=false&include-footnotes=false`,
          {
            headers: {
              Authorization: `Token ${this.apiKeys.esv}`,
              'User-Agent': 'BibleExplorer/1.0',
            },
            signal: controller.signal,
            cache: 'default',
            mode: 'cors',
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 401) {
            console.warn('ESV API requires valid authentication. Skipping to next source.');
            return null;
          }
          if (response.status === 429) {
            console.warn('ESV API rate limit exceeded');
            return null;
          }
          throw new Error(`ESV API request failed: ${response.status}`);
        }

        // Security: Validate response content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response content type');
        }

        const data = await response.json();

        // Security: Basic response validation
        if (typeof data !== 'object' || !data.passages) {
          throw new Error('Invalid API response structure');
        }

        return source.format(data, cleanReference);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('ESV API request timed out');
        } else {
          console.warn('ESV API failed:', error.message);
        }
        return null;
      }
    } else if (source.name === 'bible-api') {
      // Bible API format with sanitized parameters
      const formattedRef = encodeURIComponent(cleanReference.replace(/\s+/g, '+').toLowerCase());

      try {
         
        const controller =
          typeof AbortController !== 'undefined'
            ? new AbortController()
            : { signal: null, abort: () => {} };
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        // Validate URL before making request
        const fullUrl = `${source.endpoint}${formattedRef}`;
        if (typeof SecurityConfig !== 'undefined' && SecurityConfig?.isUrlSafe && !SecurityConfig.isUrlSafe(fullUrl)) {
          console.warn('Security: Blocked unsafe API URL:', fullUrl);
          throw new Error('Invalid API URL blocked for security reasons');
        }

        const response = await fetch(fullUrl, {
          headers: {
            'User-Agent': 'BibleExplorer/1.0',
          },
          signal: controller.signal,
          cache: 'default',
          mode: 'cors',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 429) {
            console.warn('Bible API rate limit exceeded');
            return null;
          }
          throw new Error(`Bible API request failed: ${response.status}`);
        }

        // Security: Validate response content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response content type');
        }

        const data = await response.json();

        // Security: Basic response validation
        if (typeof data !== 'object' || !data.verses) {
          throw new Error('Invalid API response structure');
        }

        return source.format(data);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Bible API request timed out');
        } else {
          console.warn('Bible API failed:', error.message);
        }
        return null;
      }
    }

    return null;
  }

  formatEsvApiResponse(data, reference) {
    if (!data.passages || !data.passages.length) {
      throw new Error('No passages found');
    }

    // ESV API returns full chapter text with verse numbers embedded
    const passageText = data.passages[0];
    const verses = this.parseEsvPassageText(passageText);

    return {
      reference: reference,
      verses: verses,
      translation: 'English Standard Version',
    };
  }

  parseEsvPassageText(text) {
    // Split by verse numbers and clean up
    const verses = [];
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
      // Match verse numbers at the start of lines like "1 In the beginning..."
      const match = line.match(/^\s*(\d+)\s+(.+)$/);
      if (match) {
        const [, verseNum, verseText] = match;
        verses.push({
          number: parseInt(verseNum, 10),
          text: verseText.trim(),
        });
      } else if (line.trim() && verses.length > 0) {
        // Continuation of previous verse
        verses[verses.length - 1].text += ' ' + line.trim();
      }
    }

    return verses;
  }

  formatBibleApiResponse(data) {
    if (!data.verses || !data.verses.length) {
      throw new Error('No verses found');
    }

    return {
      reference: data.reference,
      verses: data.verses.map(verse => ({
        number: verse.verse,
        text: verse.text.trim(),
      })),
      translation: data.translation_name || 'World English Bible',
    };
  }

  getBibleGatewayUrl(chapterInfo) {
    const translationMap = {
      esv: 'ESV',
      niv: 'NIV',
      nlt: 'NLT',
      nkjv: 'NKJV',
      nasb: 'NASB',
      web: 'WEB',
      ampc: 'AMPC',
    };

    const version = translationMap[this.currentTranslation] || 'ESV';

    // Handle BibleGateway specific book name mappings
    const bibleGatewayBookName = this.getBibleGatewayBookName(chapterInfo.book);
    const bookChapter = `${bibleGatewayBookName} ${chapterInfo.chapter}`;

    // Detect mobile and add interface parameters for better mobile experience
    const isMobile = window.innerWidth <= 768;
    const baseUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(bookChapter)}&version=${version}`;

    if (isMobile) {
      // Add mobile-optimized parameters
      return `${baseUrl}&interface=mobile`;
    }

    return baseUrl;
  }

  // BibleGateway specific book name formatting
  getBibleGatewayBookName(bookName) {
    const bibleGatewayMap = {
      'Song of Songs': 'Song of Solomon',
    };

    return bibleGatewayMap[bookName] || bookName;
  }

  renderChapterContent(data, chapterInfo) {
    const versesHtml = data.verses
      .map(
        verse => `
      <div class="chapter-reader-verse">
        <span class="chapter-verse-number">${verse.number}</span>
        <span class="chapter-verse-text">${this.escapeHtml(verse.text)}</span>
      </div>
    `
      )
      .join('');

    const bibleGatewayUrl = this.getBibleGatewayUrl(chapterInfo);

    return `
      <div class="chapter-reader-fast-content">
        <div class="chapter-reader-header-links">
          <div class="chapter-reader-translation-info">
            <span class="translation-badge">${this.escapeHtml(data.translation)}</span>
          </div>
          <div class="chapter-reader-external-links">
            <a href="${bibleGatewayUrl}" target="_blank" class="biblegateway-link">
              ⧉ View on BibleGateway
            </a>
            <button class="cross-references-btn" onclick="window.chapterReaderInstance.showCrossReferences('${chapterInfo.reference}')">
              Cross references on Bible Gateway (new tab)
            </button>
          </div>
        </div>
        <div class="chapter-reader-verses">
          ${versesHtml}
        </div>
        <div class="chapter-reader-footer">
          <p class="chapter-reader-note">
            For cross-references, commentary, and study tools, 
            <a href="${bibleGatewayUrl}" target="_blank">view this chapter on BibleGateway</a>.
          </p>
        </div>
      </div>
    `;
  }

  setupKeyboardNavigation() {
    // Remove existing handler if present
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler);
    }

    // Create and store new handler
    this.keydownHandler = e => {
      if (this.currentModal) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.closeChapterReader();
        }
      }
    };

    document.addEventListener('keydown', this.keydownHandler);
  }

  showCrossReferences(reference) {
    // Open BibleGateway in a new tab for cross-references
    const translationMap = {
      esv: 'ESV',
      niv: 'NIV',
      nlt: 'NLT',
      nkjv: 'NKJV',
      nasb: 'NASB',
      web: 'WEB',
      ampc: 'AMPC',
    };
    const version = translationMap[this.currentTranslation] || 'ESV';
    const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=${version}`;
    window.open(url, '_blank', 'noopener');
  }

  // Security: HTML sanitization for chapter content
  escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Public API for manual usage
  static openChapter(book, chapter) {
    if (!window.chapterReaderInstance) {
      window.chapterReaderInstance = new ChapterReader();
    }

    const chapterInfo = {
      book: book,
      chapter: chapter,
      reference: `${book} ${chapter}`,
    };

    window.chapterReaderInstance.openChapterReader(chapterInfo);
  }

  // Secure API key loading - prevents hardcoded secrets
  loadApiKeys() {
    // Try to load from window.BIBLE_EXPLORER_CONFIG (set by build process)
    if (
      typeof window !== 'undefined' &&
      window.BIBLE_EXPLORER_CONFIG &&
      window.BIBLE_EXPLORER_CONFIG.apiKeys
    ) {
      return window.BIBLE_EXPLORER_CONFIG.apiKeys;
    }

    // Try localStorage (for development - not recommended for production)
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('bibleExplorerApiKeys');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {
        console.warn('[ChapterReader] Invalid API keys in localStorage');
      }
    }

    // Fallback to empty object - APIs will fail gracefully
    console.warn('[ChapterReader] No API keys configured. Scripture loading will be limited.');
    return {};
  }

}

// Initialize when DOM is ready OR immediately if DOM is already ready
function initializeChapterReader() {
  if (!window.chapterReaderInstance) {
    window.chapterReaderInstance = new ChapterReader();
    console.log('[ChapterReader] Initialized and chapter buttons added');
  } else {
    console.log('[ChapterReader] Instance already exists, skipping initialization');
  }
}

// Check if DOM is already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChapterReader);
} else {
  // DOM is already ready, initialize immediately
  initializeChapterReader();
}

// Also listen for custom events from module loader - RACE CONDITION PROTECTION
document.addEventListener('chapterReaderLoaded', () => {
  // Prevent double initialization
  if (window.chapterReaderInstance) {
    console.warn('[ChapterReader] Already initialized, skipping duplicate initialization');
    return;
  }
  initializeChapterReader();
});

// Global function for use in onclick handlers
function openChapterReader(reference, book, chapter) {
  if (!window.chapterReaderInstance) {
    window.chapterReaderInstance = new ChapterReader();
  }

  const chapterInfo = {
    book: book,
    chapter: chapter,
    reference: reference,
  };

  window.chapterReaderInstance.openChapterReader(chapterInfo);
}

// Make it available globally
window.openChapterReader = openChapterReader;

// Export for manual use
window.ChapterReader = ChapterReader;
