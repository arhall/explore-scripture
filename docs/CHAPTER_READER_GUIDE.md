# Chapter Reader Implementation Guide

## Overview

The Chapter Reader provides an advanced Bible reading experience with
modal-based chapter display, live translation switching, and mobile
optimization. It integrates seamlessly with BibleGateway for 7 different Bible
translations without requiring page refreshes.

## Features

### ✅ Core Functionality

- **Live Translation Switching**: Change Bible versions instantly (ESV, NIV,
  NLT, NKJV, NASB, AMPC, WEB)
- **Embedded BibleGateway**: Full chapter content via responsive iframes with
  proper URL generation
- **Modal Interface**: Clean, professional reading environment with modern UX
  design
- **Mobile Optimization**: Maximized viewport space by hiding external links on
  mobile devices
- **Single Button Interface**: No duplicate "Read Chapter" buttons per chapter
- **Smart Duplicate Detection**: Prevents multiple buttons from appearing for
  the same chapter
- **Performance Optimized**: Minimal JavaScript footprint with component-based
  architecture

### 🎨 Visual Design

- **Translation Selector**: Dropdown in modal header for instant version
  switching
- **Clean Interface**: Professional header with chapter reference and responsive
  controls
- **Mobile-First Design**: External links hidden on mobile for maximum reading
  space
- **Theme Integration**: Full compatibility with 24-theme system and dark mode
- **Professional Styling**: Clean buttons without emojis, proper focus states
- **Accessibility**: ARIA labels, keyboard navigation (ESC to close), semantic
  markup

## Implementation

### 1. Basic Usage

The Chapter Reader is automatically available on all book pages. Users click
"Read Chapter" buttons to open chapters:

```html
<button
  class="read-chapter-btn"
  onclick="openChapterReader('Genesis 1', 'Genesis', 1)"
  title="Read chapter with BibleGateway"
>
  ▦ Read Chapter
</button>
```

### 2. JavaScript API

#### Opening a Chapter

```javascript
// Global function for onclick handlers
openChapterReader(reference, book, chapter);

// Class method for programmatic use
window.chapterReaderInstance.openChapterReader({
  reference: 'Genesis 1',
  book: 'Genesis',
  chapter: 1,
});

// Static method
ChapterReader.openChapter('Genesis', 1);
```

#### Example Usage

```javascript
// Open Genesis 1
openChapterReader('Genesis 1', 'Genesis', 1);

// Open Matthew 5
openChapterReader('Matthew 5', 'Matthew', 5);

// Open Romans 8
openChapterReader('Romans 8', 'Romans', 8);
```

### 3. Modal Structure

The Chapter Reader creates a modal with the following structure:

```html
<div class="chapter-reader-overlay">
  <div class="chapter-reader-modal">
    <div class="chapter-reader-header">
      <h2 class="chapter-reader-title">Genesis 1</h2>
      <div class="chapter-reader-controls">
        <a
          href="[biblegateway-url]"
          target="_blank"
          class="chapter-reader-external-link"
        >
          ⧉ Open in New Tab
        </a>
        <button class="chapter-reader-close" aria-label="Close chapter reader">
          ×
        </button>
      </div>
    </div>
    <div class="chapter-reader-content">
      <div class="chapter-reader-iframe-container">
        <iframe
          src="[biblegateway-url]"
          class="chapter-reader-iframe"
          title="Genesis 1 - ESV"
        >
        </iframe>
        <div class="chapter-reader-iframe-fallback">
          <p>If the Bible content doesn't load above, you can:</p>
          <a
            href="[biblegateway-url]"
            target="_blank"
            class="chapter-reader-external-link"
          >
            ▦ Open Genesis 1 on BibleGateway
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
```

## Configuration

### BibleGateway Integration

The Chapter Reader uses BibleGateway.com for chapter content:

- **Default Translation**: ESV (English Standard Version)
- **URL Format**:
  `https://www.biblegateway.com/passage/?search={book}%20{chapter}&version=ESV`
- **Iframe Sandbox**: Secure sandbox with necessary permissions
- **Fallback Support**: Direct links if iframe fails to load

### Responsive Sizing

The iframe automatically adjusts based on screen size:

```css
/* Desktop (default) */
.chapter-reader-iframe {
  height: 600px;
  min-height: 400px;
}

/* Tablet and smaller (768px and below) */
@media (max-width: 768px) {
  .chapter-reader-iframe {
    height: 500px;
    min-height: 350px;
  }

  .chapter-reader-modal {
    height: 90vh;
  }
}

/* Mobile (480px and below) */
@media (max-width: 480px) {
  .chapter-reader-iframe {
    height: 400px;
    min-height: 300px;
  }

  .chapter-reader-modal {
    height: 95vh;
    width: 98vw;
  }
}

/* Large desktop (1200px and above) */
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
```

## Performance Considerations

### Conditional Loading

The Chapter Reader script is only loaded on book pages to ensure optimal
performance:

```njk
{% if layout == "book.njk" %}
<!-- Chapter Reader (loaded only on book pages) -->
<script src="/assets/chapter-reader.js"></script>
{% endif %}
```

### Iframe Optimization

- **Lazy Loading**: Iframe uses `loading="lazy"` attribute
- **Sandbox Security**: Restricted permissions for safety
- **Fallback Strategy**: Direct links if iframe fails
- **No Preloading**: Iframes only load when modal opens

### Memory Management

- **Single Modal**: Only one modal can be open at a time
- **Proper Cleanup**: Modal removed from DOM when closed
- **Event Listeners**: Properly attached and cleaned up

## User Experience

### Desktop Interaction

- **Click to Open**: Click "Read Chapter" button
- **Multiple Close Options**: Close button, ESC key, or click overlay
- **External Access**: "Open in New Tab" for full BibleGateway experience
- **Smooth Animations**: Fade in/out transitions

### Mobile Interaction

- **Touch-Friendly**: Large tap targets for mobile users
- **Responsive Modal**: Takes up most of screen real estate
- **Swipe-Friendly**: Modal positioned to avoid conflicts with browser gestures
- **Fast Loading**: Optimized for mobile networks

### Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **ARIA Labels**: Proper accessibility labels
- **Screen Reader Support**: Semantic HTML structure
- **Focus Management**: Proper focus handling when modal opens/closes
- **High Contrast**: Works with site's high contrast mode

## Integration Points

### Book Page Integration

Chapter Reader buttons are automatically added to all book pages with chapter
summaries:

```njk
<div class="commentary-actions">
  <button class="read-chapter-btn"
          onclick="openChapterReader('{{ book.name }} {{ ch }}', '{{ book.name }}', {{ ch }})"
          title="Read chapter with BibleGateway">
    ▦ Read Chapter
  </button>
  <a href="{{ book.name | commentaryUrl(ch) }}"
     target="_blank"
     class="commentary-link"
     rel="noopener">
    ◈ Commentary
  </a>
</div>
```

### Analytics Integration

The Chapter Reader tracks usage via the site's telemetry system:

```javascript
if (window.telemetry) {
  window.telemetry.recordUserAction(
    'chapter-reader-open',
    chapterInfo.reference
  );
}
```

## Testing

### Automated Tests

The Chapter Reader includes comprehensive test coverage:

- **Loading Tests**: Verifies script loads only on book pages
- **Button Tests**: Confirms "Read Chapter" buttons are present
- **Modal Tests**: Tests modal opening, content, and closing
- **Responsive Tests**: Verifies sizing across different screen sizes
- **Accessibility Tests**: Ensures proper accessibility features
- **Cross-Book Tests**: Tests functionality across different books

### Manual Testing Checklist

- [ ] Click "Read Chapter" button opens modal
- [ ] Modal displays correct chapter reference in header
- [ ] BibleGateway iframe loads with correct content
- [ ] "Open in New Tab" button works correctly
- [ ] Modal closes via close button, ESC key, and overlay click
- [ ] Responsive sizing works on desktop, tablet, and mobile
- [ ] Accessibility features work with keyboard and screen readers
- [ ] Works across different books (Genesis, Matthew, Romans, etc.)

## Troubleshooting

### Common Issues

#### Modal Doesn't Open

- **Check JavaScript**: Verify `openChapterReader` function is defined
- **Console Errors**: Look for JavaScript syntax errors
- **Button Onclick**: Ensure onclick handler is properly formatted

#### Iframe Doesn't Load

- **Network Issues**: Check internet connection to BibleGateway
- **CORS Policy**: BibleGateway allows iframe embedding
- **Fallback Link**: Users can click fallback link to open in new tab

#### Responsive Issues

- **CSS Loading**: Verify stylesheet is loaded properly
- **Media Queries**: Check browser dev tools for applied styles
- **Viewport Meta**: Ensure viewport meta tag is present

### Debug Mode

Enable debug mode to see additional logging:

```javascript
localStorage.setItem('bibleExplorerDebug', 'true');
// or add ?debug=true to URL
```

## Future Enhancements

### Planned Features

- [ ] Translation selector within modal
- [ ] Chapter navigation (previous/next buttons)
- [ ] Bookmarking specific chapters
- [ ] Social sharing integration
- [ ] Print-friendly formatting
- [ ] Full-text search within chapters

### Technical Improvements

- [ ] Service Worker caching for offline support
- [ ] Progressive loading for large chapters
- [ ] Custom BibleGateway API integration
- [ ] Enhanced error handling and retry logic
- [ ] Performance monitoring and analytics

The Chapter Reader significantly enhances the Bible study experience by
providing immediate access to full chapter content while maintaining the site's
performance and user experience standards. Its responsive design and
accessibility features ensure it works well for all users across all devices.
