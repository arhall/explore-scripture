import {
  COMMENTARY_PROXY_JSON_HEADERS,
  fetchEnduringWordCommentary,
  getCommentaryErrorStatus,
  isValidCommentarySlug,
} from '../../../../lib/commentary-proxy.js';

export async function onRequestGet(context) {
  const slug = context.params.slug;

  if (!isValidCommentarySlug(slug)) {
    return new Response(JSON.stringify({ error: 'Invalid commentary slug' }), {
      status: 400,
      headers: COMMENTARY_PROXY_JSON_HEADERS,
    });
  }

  try {
    const commentary = await fetchEnduringWordCommentary(slug);
    return new Response(JSON.stringify(commentary), {
      status: 200,
      headers: COMMENTARY_PROXY_JSON_HEADERS,
    });
  } catch (error) {
    const status = getCommentaryErrorStatus(error, 'No Enduring Word commentary');
    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: COMMENTARY_PROXY_JSON_HEADERS,
    });
  }
}
