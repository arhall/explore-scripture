# Bible Explorer — Interactive Study Site

A comprehensive Bible study platform featuring:
- **66 Biblical books** organized by categories (Law, History, Poetry, Prophets, Gospels, Epistles, Apocalypse)
- **229 Biblical characters** with detailed study profiles and gospel connections
- **Interactive chapter reader** with live translation switching (ESV, NIV, NLT, NKJV, NASB, AMPC, WEB)
- **Professional UX design** optimized for desktop and mobile study
- **Modern theme system** with 24 color themes and dark mode support

Built with **Eleventy (11ty)** for fast, static generation and deployed on **Cloudflare Pages**.

---

## Local Development

```bash
# 1) Install deps
npm install

# 2) Run dev server
npm run dev
# or build without serving
npm run build
```

- Input: `src/`
- Output: `_site/`

---

## Deploy to Cloudflare Pages

1. Push this repo to GitHub or GitLab.
2. In **Cloudflare Dashboard → Pages → Create a project → Connect to Git**.
3. Select your repo and use these settings:
   - **Framework preset**: *Eleventy*
   - **Build command**: `npm run build`
   - **Output directory**: `_site`
4. Click **Save and Deploy**.
5. You’ll get a URL like `https://your-project.pages.dev`.
6. (Optional) **Custom domain** → Pages → *Your Project* → **Custom domains** → add your domain.

---

## Editing Content

- All books are defined in `src/_data/books.json`.
- Each book has a `chapterSummaries` object with chapter numbers as keys.
- Fill in or edit summaries as you go. You can start with the provided samples (Genesis 1–3, Matthew 1–3, Romans 1–2).

Tip: If you'd like markdown-rich summaries, you can put markdown in the summary strings—they'll render nicely.

---

## Key Features

### 📖 Chapter Reader
- **Interactive Reading**: Modal-based full chapter experience with BibleGateway integration
- **Live Translation Switching**: Change Bible versions instantly without page refresh
- **7 Translations**: ESV, NIV, NLT, NKJV, NASB, AMPC, WEB support with proper URL generation
- **Mobile Optimized**: Maximized viewport space with responsive controls
- **Clean Interface**: Single "Read Chapter" button per chapter, no duplicate UI elements

### 👥 Character Studies  
- **229 Biblical Characters**: Comprehensive profiles with detailed analysis
- **Professional Layout**: Clean, card-based design optimized for readability
- **Gospel Connections**: How each character points to Christ with theological insights
- **Responsive Design**: Mobile-friendly with proper spacing and typography
- **Study Resources**: Integration with StudyandObey.com character studies

### 🎨 Modern UX Design
- **Professional Styling**: Clean, minimal interface without excessive decorations
- **24 Theme System**: Complete color theme support with automatic dark mode
- **Mobile First**: Responsive design optimized for all device sizes
- **Fast Performance**: Static generation with optimized loading times
- **Accessibility**: Proper ARIA labels, keyboard navigation, and focus states

### 📜 Scripture Widget
- **Quick References**: Hover/tap Scripture references for instant verse lookup
- **Multi-Translation**: Supports all available Bible versions
- **Smart Integration**: Automatic enhancement of scripture references
- **Theme Compatible**: Matches site theme and color scheme

---

## Technical Details

### Architecture
- **Static Generation**: Built with Eleventy (11ty) for fast, SEO-friendly pages
- **Data-Driven**: All content managed through JSON data files for easy maintenance
- **Component-Based**: Modular JavaScript components for interactive features
- **CSS Custom Properties**: Modern CSS with full theme system integration
- **Responsive Images**: Optimized assets with proper loading strategies

### Performance
- **Build Analysis**: Comprehensive logging system with performance metrics
- **Optimized Bundle**: Minimal JavaScript footprint with lazy loading
- **CDN Ready**: Designed for Cloudflare Pages with edge optimization
- **Fast Builds**: Efficient generation of 300+ pages in under 3 seconds

### Content Management
- **66 Biblical Books**: Complete metadata with chapter-by-chapter summaries
- **229 Character Profiles**: Detailed study content with gospel connections  
- **10 Categories**: Organized scripture sections (Law, Prophets, Gospels, etc.)
- **Commentary Integration**: Direct links to Enduring Word commentary
- **Translation Support**: Multiple Bible versions with proper API integration

---

## Documentation

- **[Chapter Reader Guide](docs/CHAPTER_READER_GUIDE.md)**: Complete chapter reader documentation
- **[Scripture Widget Guide](docs/SCRIPTURE_WIDGET_GUIDE.md)**: Scripture reference system
- **[Developer Guide](docs/DEVELOPER_GUIDE.md)**: Technical implementation details
- **[Performance Guide](docs/PERFORMANCE.md)**: Optimization and build analysis
