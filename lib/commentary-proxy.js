export const COMMENTARY_PROXY_JSON_HEADERS = {
  'Content-Type': 'application/json; charset=UTF-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=14400',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'X-Content-Type-Options': 'nosniff',
};

export const STUDYLIGHT_SOURCE_NAMES = {
  bnb: "Barnes' Notes",
  cal: "Calvin's Bible Commentaries",
  phc: "Preacher's Homiletic Commentary",
  tbi: 'The Biblical Illustrator (Exell)',
};

export function isValidCommentarySlug(slug) {
  return /^[a-z0-9-]+$/.test(slug || '');
}

export function isValidStudyLightSource(source) {
  return Object.prototype.hasOwnProperty.call(STUDYLIGHT_SOURCE_NAMES, source || '');
}

export function getCommentaryErrorStatus(error, notFoundPattern) {
  return String(error?.message || '').includes(notFoundPattern) ? 404 : 502;
}

function normalizeCommentaryUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return String(url || '').replace(/\/$/, '');
  }
}

function pickEnduringWordEntry(entries, slug) {
  const targetUrl = normalizeCommentaryUrl(`https://enduringword.com/bible-commentary/${slug}/`);

  return (
    entries.find(item => normalizeCommentaryUrl(item.link) === targetUrl) ||
    entries.find(item => {
      const normalizedLink = normalizeCommentaryUrl(item.link);
      return (
        normalizedLink.includes(`/bible-commentary/${slug}`) &&
        !normalizedLink.includes('/bible-commentary/ar/') &&
        !normalizedLink.includes('/bible-commentary/es/') &&
        !normalizedLink.includes('/bible-commentary/it/') &&
        !normalizedLink.includes('/bible-commentary/pt/')
      );
    })
  );
}

function buildStudyLightPrintUrl(source, slug) {
  return `https://www.studylight.org/commentaries/eng/${source}/${slug}.html?print=yes`;
}

function extractBodyHtml(html) {
  const bodyMatch = String(html || '').match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch?.[1] || html;
}

function extractTextContent(htmlFragment) {
  return String(htmlFragment || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractStudyLightTitle(html, fallbackTitle) {
  const heading = extractTextContent(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
  const commentaryName = extractTextContent(html.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1]);

  return [commentaryName, heading].filter(Boolean).join(' - ') || fallbackTitle;
}

export async function fetchEnduringWordCommentary(slug) {
  const apiUrl = new URL('https://enduringword.com/wp-json/wp/v2/commentary');
  apiUrl.searchParams.set('slug', slug);
  apiUrl.searchParams.set('_fields', 'id,link,title,content');

  const response = await fetch(apiUrl.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Enduring Word returned ${response.status}`);
  }

  const entries = await response.json();
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error(`No Enduring Word commentary found for ${slug}`);
  }

  const entry = pickEnduringWordEntry(entries, slug);
  if (!entry?.content?.rendered) {
    throw new Error(`No renderable Enduring Word commentary found for ${slug}`);
  }

  return {
    html: entry.content.rendered,
    sourceUrl: entry.link || `https://enduringword.com/bible-commentary/${slug}/`,
    title: entry.title?.rendered || slug,
  };
}

export async function fetchStudyLightCommentary(source, slug) {
  if (!isValidStudyLightSource(source)) {
    throw new Error(`Unsupported StudyLight source: ${source}`);
  }

  const printUrl = buildStudyLightPrintUrl(source, slug);
  const response = await fetch(printUrl, {
    headers: {
      Accept: 'text/html',
    },
  });

  if (response.status === 404) {
    throw new Error(`No StudyLight commentary found for ${source}/${slug}`);
  }

  if (!response.ok) {
    throw new Error(`StudyLight returned ${response.status}`);
  }

  const html = await response.text();
  const bodyHtml = extractBodyHtml(html);
  const fallbackTitle = `${STUDYLIGHT_SOURCE_NAMES[source]} - ${slug}`;

  if (!bodyHtml || !bodyHtml.trim()) {
    throw new Error(`No renderable StudyLight commentary found for ${source}/${slug}`);
  }

  return {
    html: bodyHtml,
    sourceUrl: printUrl,
    title: extractStudyLightTitle(bodyHtml, fallbackTitle),
  };
}
