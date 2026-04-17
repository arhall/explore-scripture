import {
  COMMENTARY_PROXY_JSON_HEADERS,
  fetchStudyLightCommentary,
  getCommentaryErrorStatus,
  isValidCommentarySlug,
  isValidStudyLightSource,
} from '../../../../../lib/commentary-proxy.js';

export async function onRequestGet(context) {
  const source = context.params.source;
  const slug = context.params.slug;

  if (!isValidStudyLightSource(source) || !isValidCommentarySlug(slug)) {
    return new Response(JSON.stringify({ error: 'Invalid StudyLight commentary request' }), {
      status: 400,
      headers: COMMENTARY_PROXY_JSON_HEADERS,
    });
  }

  try {
    const commentary = await fetchStudyLightCommentary(source, slug);
    return new Response(JSON.stringify(commentary), {
      status: 200,
      headers: COMMENTARY_PROXY_JSON_HEADERS,
    });
  } catch (error) {
    const status = getCommentaryErrorStatus(error, 'No StudyLight commentary');
    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: COMMENTARY_PROXY_JSON_HEADERS,
    });
  }
}
