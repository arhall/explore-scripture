# Bible Static Site (Eleventy) — Cloudflare Pages Ready

A statically generated site with:
- A home page listing **sections/categories** (Law, History, Poetry/Writings, Major Prophets, Minor Prophets, Gospels, Acts, Pauline Epistles, General Epistles, Apocalypse).
- Individual **book pages** (all 66) with metadata (testament, category, traditional author, original language) and **chapter-by-chapter summary placeholders**.
- **Category pages** that list the books in that section.

Built with **Eleventy (11ty)** for a super simple static build, ideal for **Cloudflare Pages**.

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

## Interactive Features

The site includes several interactive features for enhanced Bible study:

### Chapter Reader
- **Purpose**: Modal-based full chapter reading with BibleGateway integration
- **Usage**: Click "Read Chapter" buttons on book pages
- **Documentation**: See [docs/CHAPTER_READER_GUIDE.md](docs/CHAPTER_READER_GUIDE.md)
- **Features**: Embedded iframes, responsive design, external link access

### Scripture Widget
- **Purpose**: Hover/tap Scripture references for quick verse lookup
- **Usage**: Automatic enhancement of `data-scripture` attributes
- **Documentation**: See [docs/SCRIPTURE_WIDGET_GUIDE.md](docs/SCRIPTURE_WIDGET_GUIDE.md)  
- **Features**: Multiple translations, mobile-friendly, theme integration

---

## Notes

- This starter includes **all 66 books** with metadata and empty chapter summaries (except a few example chapters).
- Categories and descriptions live in `src/_data/categories.json`.
- Styling is intentionally minimal (`src/styles.css`) so you can adapt easily.
