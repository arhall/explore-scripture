# Explore Scripture - TODO List

## Current Priority: Content Enhancement & Advanced Features

### ✅ Major Features Completed

- [x] **Entity System**: 5,516 biblical entities with comprehensive profiles and
      cross-references
- [x] **Interactive Chapter Reader**: Live translation switching (ESV, NIV, NLT,
      NKJV, NASB, AMPC, WEB)
- [x] **Commentary System**: 11 high-quality commentary sources with modal
      interface
- [x] **Advanced Search Engine**: Fuzzy matching, relevance scoring, and
      autocomplete across all content
- [x] **Professional UX Design**: Clean, mobile-first interface with 24-theme
      system
- [x] **Mobile Optimization**: Maximized viewport space, responsive controls,
      touch-friendly interface
- [x] **Performance Optimization**: Build system processes 5,516+ entities
      efficiently
- [x] **Comprehensive Testing**: Selenium test suite with build quality gates
- [x] **Security Hardening**: XSS prevention, input sanitization, and memory
      leak fixes
- [x] **Documentation Updates**: README, CLAUDE.md updated with latest
      architecture
- [x] **Bug Fixes**: Critical ESLint errors resolved (38→0), memory leaks fixed

### 📋 Current Priorities

#### ✅ COMPLETED: Biblical Genealogy Tree Visualization

**Status**: FULLY IMPLEMENTED | **Location**: `src/genealogies.njk` | **Completed**: January 2025

**Features Implemented**:

- [x] **Interactive D3.js Tree**: Full genealogy tree from Adam to Jesus with 7 thematic clusters
- [x] **Multi-line Tooltips**: Scripture references from `tooltipRaw` field with proper formatting
- [x] **Messianic Line Highlighting**: 134 individuals marked in red (Matthew 1 & Luke 3 genealogies)
- [x] **Dynamic Circle States**: Filled when unexpanded, hollow when expanded or leaf nodes
- [x] **Seven Clusters**: Primeval, Patriarchs, Tribal, Priestly, Royal, Messianic, Judges
- [x] **Judges Cluster**: Populated with 17 judges (Othniel, Ehud, Tola, Jair, Jephthah, Gideon, Eli, Samuel, etc.)
- [x] **Zoom & Pan Controls**: Interactive navigation with mouse/touch support
- [x] **Search Functionality**: Find and highlight specific biblical figures
- [x] **Keyboard Navigation**: Arrow keys, Enter to expand/collapse
- [x] **Theme Integration**: Full dark/light mode support

**Data Pipeline**:
- Source: `data/bible-tree-data/raw-latest/nodes.csv`
- Scripts: `mark_messianic_line.py`, `mark_judges.py`, `generate_bible_tree.py`
- Output: `src/assets/data/bible-tree.json`

**Styling**:
- Regular nodes: Solid `rgb(102, 121, 168)` (blue) when filled
- Messianic line: Solid `#dc143c` (red) when filled
- Hollow strokes when expanded or leaf nodes

**Testing**:
- Test suite: `tests/test_genealogy_visualization.py`
- Coverage: Page loading, cluster navigation, highlighting, tooltips, circle states

#### Content Enhancement

- [ ] **Chapter Summaries**: Complete all 66 books with comprehensive
      chapter-by-chapter summaries
- [ ] **Character Profile Expansion**: Add more detailed gospel connections and
      cross-references
- [ ] **Theological Themes**: Expand theological theme macros with more
      comprehensive coverage
- [ ] **Cross-References**: Validate and expand Scripture cross-references
      throughout content
- [ ] **Study Questions**: Add discussion questions for books and character
      studies

#### Advanced Features

- [x] **Chapter Navigation**: Previous/next chapter navigation within chapter
      reader
- [ ] **Bookmarking System**: Allow users to bookmark favorite verses and
      chapters
- [ ] **Print Optimization**: CSS print styles for study materials
- [ ] **Social Sharing**: Share verses and character insights on social media
- [ ] **Offline Reading**: Service Worker for offline access to previously
      viewed content

#### SEO & Performance

- [ ] **Structured Data**: JSON-LD markup for biblical content
- [ ] **Meta Optimization**: Enhanced meta descriptions and Open Graph tags
- [ ] **Core Web Vitals**: Optimize Largest Contentful Paint and Cumulative
      Layout Shift
- [ ] **Image Optimization**: WebP support and lazy loading for character
      portraits
- [ ] **Bundle Analysis**: Further JavaScript and CSS optimization

#### User Experience Enhancements

- [ ] **Reading Plans**: Guided Bible reading plans with progress tracking
- [ ] **Advanced Search**: Full-text search across all content with relevance
      scoring
- [ ] **User Preferences**: Save theme, translation, and layout preferences
- [ ] **Accessibility Audit**: WCAG 2.1 AA compliance verification
- [ ] **Performance Monitoring**: Real-time performance metrics and error
      tracking

### 🚫 Removed Features (Previously Completed)

- ~~Personal notes functionality~~
- ~~Personal highlighting~~
- ~~Study questions~~
- ~~PDF export functionality~~

### 📝 Current Status Notes

#### System Health ✅

- **Explore Scripture Platform**: Fully functional comprehensive Bible study
  site
- **Entity System**: 5,516 biblical entities processed and indexed successfully
- **Chapter Reader**: Live translation switching without page refresh
- **Commentary System**: 11 high-quality sources integrated
- **Search Engine**: Advanced fuzzy matching with autocomplete across all
  content
- **Security**: XSS vulnerabilities patched, input sanitization active
- **Performance**: Memory leaks fixed, event listener cleanup implemented
- **Code Quality**: ESLint critical errors resolved (38→0), only 76 warnings
  remain
- **Build System**: Entity processing confirmed working, generates 5,516+
  entities
- **Mobile Optimization**: Responsive design and touch-friendly interface
  complete
- **Genealogy Minimap**: Functionally available; pending QA on new scaling
  approach (see active fix above).

#### Recent Fixes (Latest Session)

- ✅ **Build Path Error**: Fixed entity-processor.js INPUT_DIR after repo
  reorganization
- ✅ **XSS Security**: Added HTML escaping in search interface
- ✅ **Memory Leaks**: Fixed event listener accumulation in SearchInterface and
  ChapterReader
- ✅ **Browser Compatibility**: Added feature detection for modern APIs
- ✅ **Performance**: Proper cleanup implemented for dynamic components

#### Latest Improvements (Current Session)

- ✅ **Read Chapter Button Duplication**: Fixed duplicate button issue by
  preventing chapter-reader.js from initializing when commentary-reader.js is
  present
- ✅ **Genealogy Minimap State Cache**: `src/genealogies.njk` now stores node and
  link sets so minimap scale recalculates with the latest bounds after
  fit-to-stage.
- ✅ **Biblical Genealogy Explorer**: Complete implementation deployed with
  interactive D3.js family tree, search, navigation, and export features
- ✅ **Chapter Navigation**: Added Previous/Next chapter navigation to Chapter
  Reader modal with proper chapter count tracking and smooth transitions

#### Implementation Status

- 🎯 **System Health**: All critical features operational with comprehensive
  Bible study tools available
