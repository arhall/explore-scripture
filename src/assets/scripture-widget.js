/**
 * Scripture Widget - Embedded Bible verse display with configurable translations
 * Supports hover on desktop, tap on mobile
 */

class ScriptureWidget {
  constructor() {
    this.translations = {
      esv: { name: 'English Standard Version', api: 'esv' },
      niv: { name: 'New International Version', api: 'niv' },
      nlt: { name: 'New Living Translation', api: 'nlt' },
      nkjv: { name: 'New King James Version', api: 'nkjv' },
      nasb: { name: 'New American Standard Bible', api: 'nasb' },
      ampc: { name: 'Amplified Bible Classic', api: 'ampc' },
    };

    this.apiSources = [
      {
        name: 'bible-api',
        endpoint: 'https://bible-api.com/',
        format: this.formatBibleApiResponse.bind(this),
      },
      {
        name: 'api.bible',
        endpoint: 'https://api.scripture.api.bible/v1/bibles/',
        apiKey: null, // Would need API key for production
        format: this.formatApiBibleResponse.bind(this),
      },
    ];

    this.cache = new Map();
    this.currentTranslation = localStorage.getItem('preferred-translation') || 'esv';
    this.init();
  }

  init() {
    this.createStyles();
    this.initializeWidgets();
    this.initializeTranslationSelector();
  }

  createStyles() {
    if (document.getElementById('scripture-widget-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'scripture-widget-styles';
    styles.textContent = `
      .scripture-reference {
        display: inline;
        color: var(--accent, #2563eb);
        cursor: pointer;
        text-decoration: underline;
        text-decoration-style: dotted;
        position: relative;
      }

      .scripture-reference:hover {
        color: var(--accent-dark, #1e40af);
        text-decoration-style: solid;
      }

      .scripture-widget {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: var(--card, #ffffff);
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        padding: 1rem;
        max-width: 400px;
        width: 90vw;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transform: translateX(-50%) translateY(-5px);
        transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
        font-size: 0.9rem;
        line-height: 1.5;
      }

      .scripture-widget.visible {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(0);
      }

      .scripture-widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-light, #f3f4f6);
      }

      .scripture-widget-reference {
        font-weight: 600;
        color: var(--accent, #2563eb);
        font-size: 0.85rem;
      }

      .scripture-widget-close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        color: var(--text-secondary, #6b7280);
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }

      .scripture-widget-close:hover {
        background: var(--bg-secondary, #f9fafb);
        color: var(--text, #111827);
      }

      .scripture-widget-content {
        margin-bottom: 0.75rem;
      }

      .scripture-widget-verse {
        margin-bottom: 0.5rem;
        color: var(--text, #111827);
        line-height: 1.6;
      }

      .scripture-widget-verse .verse-number {
        font-weight: 600;
        color: var(--accent, #2563eb);
        font-size: 0.8rem;
        margin-right: 0.3rem;
      }

      .scripture-widget-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.75rem;
        color: var(--text-secondary, #6b7280);
      }

      .scripture-widget-translation {
        font-weight: 500;
      }

      .scripture-widget-loading {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary, #6b7280);
        font-size: 0.85rem;
      }

      .scripture-widget-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid var(--border-light, #f3f4f6);
        border-top: 2px solid var(--accent, #2563eb);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .scripture-widget-error {
        color: var(--error, #dc2626);
        font-size: 0.85rem;
        text-align: center;
        padding: 1rem;
      }

      .translation-selector {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: 1rem;
        font-size: 0.8rem;
      }

      .translation-selector select {
        background: var(--card, #ffffff);
        border: 1px solid var(--border, #e5e7eb);
        border-radius: 4px;
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
        color: var(--text, #111827);
      }

      /* Mobile optimizations */
      @media (max-width: 768px) {
        .scripture-widget {
          position: fixed;
          top: auto;
          bottom: 0;
          left: 0;
          right: 0;
          transform: none;
          max-width: none;
          width: 100%;
          border-radius: 12px 12px 0 0;
          box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.15);
          transform: translateY(100%);
          transition: transform 0.3s ease, opacity 0.2s ease, visibility 0.2s ease;
        }

        .scripture-widget.visible {
          transform: translateY(0);
        }

        .scripture-reference {
          text-decoration: none;
          padding: 2px 4px;
          border-radius: 4px;
          background: rgba(37, 99, 235, 0.1);
        }

        .scripture-reference:active {
          background: rgba(37, 99, 235, 0.2);
        }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .scripture-widget {
          background: var(--card-dark, #1f2937);
          border-color: var(--border-dark, #374151);
          color: var(--text-dark, #f9fafb);
        }

        .scripture-widget-header {
          border-color: var(--border-light-dark, #4b5563);
        }

        .scripture-widget-verse {
          color: var(--text-dark, #f9fafb);
        }
      }

      [data-theme="dark"] .scripture-widget {
        background: var(--card-dark, #1f2937);
        border-color: var(--border-dark, #374151);
        color: var(--text-dark, #f9fafb);
      }

      [data-theme="dark"] .scripture-widget-header {
        border-color: var(--border-light-dark, #4b5563);
      }

      [data-theme="dark"] .scripture-widget-verse {
        color: var(--text-dark, #f9fafb);
      }
    `;
    document.head.appendChild(styles);
  }

  initializeWidgets() {
    // Find all scripture references in the content
    const references = document.querySelectorAll('[data-scripture]');
    references.forEach(ref => this.setupReference(ref));

    // Auto-detect scripture references in text (optional enhancement)
    this.autoDetectReferences();
  }

  setupReference(element) {
    const reference = element.dataset.scripture;
    if (!reference) return;

    element.classList.add('scripture-reference');

    // Desktop: hover events
    let hoverTimeout;
    element.addEventListener('mouseenter', () => {
      hoverTimeout = setTimeout(() => {
        this.showWidget(element, reference);
      }, 300); // Small delay to prevent accidental triggers
    });

    element.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimeout);
      setTimeout(() => {
        this.hideWidget(element);
      }, 100);
    });

    // Mobile: touch events
    element.addEventListener('click', e => {
      e.preventDefault();
      const widget = element.querySelector('.scripture-widget');
      if (widget && widget.classList.contains('visible')) {
        this.hideWidget(element);
      } else {
        this.showWidget(element, reference);
      }
    });
  }

  async showWidget(element, reference) {
    // Remove any existing widgets
    document.querySelectorAll('.scripture-widget').forEach(w => w.remove());

    const widget = this.createWidget(reference);
    element.appendChild(widget);

    // Position widget
    this.positionWidget(element, widget);

    // Show widget
    setTimeout(() => {
      widget.classList.add('visible');
    }, 10);

    // Load content
    await this.loadScriptureContent(widget, reference);
  }

  hideWidget(element) {
    const widget = element.querySelector('.scripture-widget');
    if (!widget) return;

    widget.classList.remove('visible');
    setTimeout(() => {
      widget.remove();
    }, 200);
  }

  createWidget(reference) {
    const widget = document.createElement('div');
    widget.className = 'scripture-widget';

    widget.innerHTML = `
      <div class="scripture-widget-header">
        <span class="scripture-widget-reference">${this.escapeHtml(reference)}</span>
        <button class="scripture-widget-close" aria-label="Close">&times;</button>
      </div>
      <div class="scripture-widget-content">
        <div class="scripture-widget-loading">
          <div class="scripture-widget-spinner"></div>
          <span>Loading Scripture...</span>
        </div>
      </div>
      <div class="scripture-widget-footer">
        <span class="scripture-widget-translation">${this.translations[this.currentTranslation].name}</span>
        <span class="scripture-widget-powered">Scripture Widget</span>
      </div>
    `;

    // Close button functionality
    widget.querySelector('.scripture-widget-close').addEventListener('click', e => {
      e.stopPropagation();
      widget.classList.remove('visible');
      setTimeout(() => widget.remove(), 200);
    });

    return widget;
  }

  positionWidget(element, widget) {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (window.innerWidth <= 768) {
      // Mobile: widget is positioned fixed at bottom
      return;
    }

    // Desktop positioning logic
    const widgetRect = widget.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - widgetRect.width / 2;

    // Ensure widget doesn't go off screen
    if (left < 10) left = 10;
    if (left + widgetRect.width > viewportWidth - 10) {
      left = viewportWidth - widgetRect.width - 10;
    }

    // Position above if not enough space below
    if (rect.bottom + widgetRect.height > viewportHeight - 20) {
      widget.style.top = 'auto';
      widget.style.bottom = '100%';
      widget.style.transform = 'translateX(-50%) translateY(-5px)';
    }
  }

  async loadScriptureContent(widget, reference) {
    const contentDiv = widget.querySelector('.scripture-widget-content');

    try {
      const cacheKey = `${reference}-${this.currentTranslation}`;
      let scriptureData = this.cache.get(cacheKey);

      if (!scriptureData) {
        scriptureData = await this.fetchScripture(reference, this.currentTranslation);
        this.cache.set(cacheKey, scriptureData);
      }

      contentDiv.innerHTML = this.renderScriptureContent(scriptureData);
    } catch (error) {
      console.error('Error loading Scripture:', error);
      contentDiv.innerHTML = `
        <div class="scripture-widget-error">
          Unable to load Scripture text. Please try again later.
        </div>
      `;
    }
  }

  async fetchScripture(reference, translation = 'esv') {
    // Try multiple API sources
    for (const source of this.apiSources) {
      try {
        const data = await this.fetchFromSource(source, reference, translation);
        if (data) return data;
      } catch (error) {
        console.warn(`Failed to fetch from ${source.name}:`, error);
        continue;
      }
    }

    // Fallback to local mock data for demo
    return this.getFallbackScripture(reference);
  }

  async fetchFromSource(source, reference, _translation) {
    if (source.name === 'bible-api') {
      // Bible API format: https://bible-api.com/john+3:16
      const formattedRef = reference.replace(/\s+/g, '+').toLowerCase();
      const response = await fetch(`${source.endpoint}${formattedRef}`);

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      return source.format(data);
    }

    return null;
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
      translation: data.translation_name || 'Unknown',
    };
  }

  formatApiBibleResponse(data) {
    // Implementation for API.Bible format
    return {
      reference: data.reference.display,
      verses: data.passages.map(passage => ({
        number: passage.verse_number,
        text: passage.text,
      })),
      translation: data.bible.name,
    };
  }

  getFallbackScripture(reference) {
    // Fallback data for common references
    const fallbacks = {
      'john 3:16': {
        reference: 'John 3:16',
        verses: [
          {
            number: 16,
            text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
          },
        ],
        translation: 'English Standard Version',
      },
      'romans 8:28': {
        reference: 'Romans 8:28',
        verses: [
          {
            number: 28,
            text: 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
          },
        ],
        translation: 'English Standard Version',
      },
      'genesis 1:1': {
        reference: 'Genesis 1:1',
        verses: [
          {
            number: 1,
            text: 'In the beginning, God created the heavens and the earth.',
          },
        ],
        translation: 'English Standard Version',
      },
    };

    const key = reference.toLowerCase();
    return (
      fallbacks[key] || {
        reference: reference,
        verses: [
          {
            number: 1,
            text: 'Scripture text temporarily unavailable. Please check your connection and try again.',
          },
        ],
        translation: 'Error',
      }
    );
  }

  renderScriptureContent(data) {
    const versesHtml = data.verses
      .map(
        verse => `
      <div class="scripture-widget-verse">
        <span class="verse-number">${verse.number}</span>
        ${verse.text}
      </div>
    `
      )
      .join('');

    return `
      <div class="scripture-widget-verses">
        ${versesHtml}
      </div>
    `;
  }

  initializeTranslationSelector() {
    // Add translation selector to page (could be in settings or header)
    const selector = document.createElement('div');
    selector.className = 'translation-selector';
    selector.innerHTML = `
      <label for="translation-select">Bible Translation:</label>
      <select id="translation-select">
        ${Object.entries(this.translations)
          .map(
            ([key, trans]) =>
              `<option value="${key}" ${key === this.currentTranslation ? 'selected' : ''}>${trans.name}</option>`
          )
          .join('')}
      </select>
    `;

    selector.querySelector('select').addEventListener('change', e => {
      this.currentTranslation = e.target.value;
      localStorage.setItem('preferred-translation', this.currentTranslation);
      this.cache.clear(); // Clear cache when translation changes
    });

    // Add to page (you might want to integrate this into your existing UI)
    const header = document.querySelector('.nav') || document.querySelector('header');
    if (header) {
      header.appendChild(selector);
    }
  }

  autoDetectReferences() {
    // Optional: Auto-detect scripture references in text
    // This would need more sophisticated implementation to avoid conflicts
    // For now, manual data-scripture attributes are recommended
  }

  // Public API for manual widget creation
  static create(element, reference) {
    if (!window.scriptureWidgetInstance) {
      window.scriptureWidgetInstance = new ScriptureWidget();
    }

    element.dataset.scripture = reference;
    window.scriptureWidgetInstance.setupReference(element);
  }

  // Utility method to escape HTML and prevent XSS
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.scriptureWidgetInstance = new ScriptureWidget();
});

// Export for manual use
window.ScriptureWidget = ScriptureWidget;
