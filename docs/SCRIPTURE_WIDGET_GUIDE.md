# Scripture Widget Implementation Guide

## Overview

The Scripture Widget provides an interactive way to display Bible verses
directly within chapter summaries and study content. Users can hover (desktop)
or tap (mobile) on Scripture references to view the full text without leaving
the page.

## Features

### ✅ Core Functionality

- **Hover/Tap Display**: Desktop hover and mobile tap support
- **Configurable Translations**: ESV, NIV, NLT, NKJV, NASB, AMPC
- **Responsive Design**: Optimized for both desktop and mobile
- **Caching**: API responses cached for better performance
- **Fallback System**: Multiple API sources with graceful degradation
- **Dark Mode Support**: Automatic theme detection
- **Accessibility**: Keyboard navigation and screen reader support

### 🎨 Visual Design

- **Clean Interface**: Minimal, non-intrusive design
- **Smooth Animations**: Subtle transitions and hover effects
- **Mobile-First**: Bottom sheet on mobile, tooltip on desktop
- **Theme Integration**: Matches site's existing color scheme

## Implementation

### 1. Basic Usage

Add `data-scripture` attribute to any element:

```html
<span data-scripture="John 3:16">John 3:16</span>
```

The widget automatically detects and enhances these elements.

### 2. Using Nunjucks Macros

Import the Scripture macros in your template:

```njk
{% from "macros/scripture.njk" import scripture, scriptureInline, scriptureBlock, gospelConnection %}
```

#### Simple Reference

```njk
{{ scripture("John 3:16") }}
{{ scripture("Romans 8:28", "All things work together for good") }}
```

#### Inline Reference

```njk
The Bible teaches us that {{ scriptureInline("John 3:16", "God so loved the world") }} and this demonstrates His love.
```

#### Block Quote

```njk
{{ scriptureBlock("Psalm 23:1", "The Lord is my shepherd, I shall not want.") }}
```

#### Gospel Connection

```njk
{{ gospelConnection("Genesis 3:15", "This first promise of redemption points to Christ's victory over Satan", "Romans 16:20") }}
```

### 3. Advanced Usage

#### Scripture List

```njk
{% from "macros/scripture.njk" import scriptureList %}

{{ scriptureList([
  {ref: "John 14:6", text: "Jesus said, 'I am the way, the truth, and the life'"},
  {ref: "Acts 4:12", text: "No other name under heaven by which we must be saved"},
  {ref: "1 Timothy 2:5", text: "One mediator between God and men"}
], "Exclusivity of Christ") }}
```

#### Cross References

```njk
{% from "macros/scripture.njk" import crossReference %}

{{ crossReference([
  {ref: "Matthew 5:17", note: "Jesus fulfills the law"},
  {ref: "Romans 3:21", note: "Righteousness apart from law"},
  {ref: "Galatians 3:24", note: "Law as schoolmaster to Christ"}
], "Law and Grace") }}
```

#### Theological Theme

```njk
{% from "macros/scripture.njk" import theologicalTheme %}

{{ theologicalTheme("Justification by Faith",
  "We are declared righteous by God through faith alone, not by works",
  ["Romans 3:28", "Ephesians 2:8-9", "Galatians 2:16"]) }}
```

## API Configuration

### Supported Translations

- **ESV**: English Standard Version
- **NIV**: New International Version
- **NLT**: New Living Translation
- **NKJV**: New King James Version
- **NASB**: New American Standard Bible
- **AMPC**: Amplified Bible Classic

### API Sources

1. **Bible API** (bible-api.com) - Primary source
2. **API.Bible** - Secondary source (requires API key)
3. **Fallback Data** - Local common verses for offline/error scenarios

## User Experience

### Desktop Behavior

- **Hover Trigger**: 300ms delay to prevent accidental activation
- **Tooltip Positioning**: Smart positioning to stay within viewport
- **Close Options**: Click close button or mouse leave after delay

### Mobile Behavior

- **Tap Activation**: Immediate response to touch
- **Bottom Sheet**: Slides up from bottom of screen
- **Touch Targets**: Optimized for finger-friendly interaction

### Translation Selector

- **Location**: Added to navigation bar
- **Persistence**: User preference saved in localStorage
- **Cache Invalidation**: Clears cache when translation changes

## Example: Enhanced Chapter Summary

```njk
---
title: "Romans 8 - Life in the Spirit"
description: "Romans 8 with embedded Scripture references for deeper study"
layout: base.njk
---

{% from "macros/scripture.njk" import scripture, gospelConnection, theologicalTheme %}

<div class="chapter-study">
  <h1>Romans 8: Life in the Spirit</h1>

  <div class="chapter-overview">
    <p>
      Romans 8 presents the glorious reality of life in the Holy Spirit for those
      who are in Christ Jesus. Paul begins by declaring that there is
      {{ scripture("Romans 8:1", "no condemnation for those who are in Christ Jesus") }},
      and goes on to describe the Spirit-led life that is characterized by freedom,
      adoption, hope, and ultimate glorification.
    </p>
  </div>

  <div class="main-themes">
    {{ theologicalTheme("No Condemnation",
      "Believers are free from the condemning power of sin and death",
      ["Romans 8:1", "Romans 5:1", "John 5:24"]) }}

    {{ gospelConnection("Romans 8:15",
      "The Spirit of adoption allows us to cry 'Abba, Father' showing our intimate relationship with God through Christ",
      "Galatians 4:6") }}
  </div>

  <h2>Key Verses</h2>
  <p>
    The chapter contains several of the most beloved verses in Scripture,
    including {{ scripture("Romans 8:28") }} and {{ scripture("Romans 8:37-39") }}.
    These verses provide comfort and assurance to believers facing trials.
  </p>
</div>
```

## Customization Options

### CSS Variables

```css
:root {
  --scripture-accent: #2563eb;
  --scripture-hover: #1e40af;
  --scripture-bg: #ffffff;
  --scripture-border: #e5e7eb;
  --scripture-shadow: rgba(0, 0, 0, 0.15);
}
```

### JavaScript Configuration

```javascript
// Customize widget behavior
window.scriptureWidgetInstance.translations['custom'] = {
  name: 'Custom Translation',
  api: 'custom-api-key',
};

// Add custom API source
window.scriptureWidgetInstance.apiSources.push({
  name: 'custom-api',
  endpoint: 'https://custom-bible-api.com/',
  format: data => ({
    /* custom format */
  }),
});
```

## Performance Considerations

### Caching Strategy

- **Memory Cache**: API responses cached during session
- **LocalStorage**: User preferences persisted
- **TTL**: 24-hour cache expiration for Scripture content

### Loading Optimization

- **Lazy Loading**: Widget scripts loaded asynchronously
- **Prefetching**: Common verses pre-cached
- **Debouncing**: Prevents excessive API calls

### Error Handling

- **Graceful Degradation**: Falls back to local content if APIs fail
- **Retry Logic**: Attempts multiple API sources before failing
- **User Feedback**: Clear error messages with retry options

## Best Practices

### Content Guidelines

1. **Reference Format**: Use standard abbreviations (e.g., "John 3:16", "1 Cor
   13:4-7")
2. **Context Consideration**: Provide enough context for verse understanding
3. **Translation Notes**: Acknowledge when specific translations are important
4. **Theological Accuracy**: Ensure references support the theological point
   being made

### User Experience

1. **Don't Overuse**: Limit to meaningful references that add value
2. **Mobile Testing**: Verify tap targets are appropriate size
3. **Loading States**: Ensure loading indicators are visible
4. **Accessibility**: Provide alternative access methods for screen readers

### Technical

1. **Error Boundaries**: Implement proper error handling
2. **Performance Monitoring**: Track API response times
3. **Analytics**: Monitor which verses are most accessed
4. **A/B Testing**: Test different interaction patterns

## Integration with Existing Features

### Search Enhancement

Scripture widgets can enhance search results by providing immediate verse
context.

### Bookmark Integration

Allow users to bookmark favorite verses discovered through widgets.

### Study Plans

Include Scripture widgets in reading plans and study guides.

### Social Sharing

Enable sharing of specific verses with their context.

## Future Enhancements

### Planned Features

- [ ] Audio playback for verses
- [ ] Multiple parallel translations
- [ ] Verse comparison tools
- [ ] Personal notes integration
- [ ] Study tool integration
- [ ] Offline mode improvements

### API Considerations

- [ ] Better fallback strategies
- [ ] Rate limiting handling
- [ ] Authentication for premium APIs
- [ ] Caching optimization
- [ ] Performance metrics

This Scripture Widget system significantly enhances the Bible study experience
by making Scripture text immediately accessible while maintaining the flow of
reading and study. The combination of smart UX design, robust fallback systems,
and flexible implementation options makes it a powerful tool for Bible education
platforms.
