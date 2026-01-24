const normalize = value =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const normalizeSearchTerm = normalize;

export const buildSearchIndex = places =>
  places.map(place => {
    const names = [
      place.names?.primary,
      ...(place.names?.also_known_as || []),
      place.names?.modern_label,
    ].filter(Boolean);
    const normalizedNames = names.map(name => normalize(name));
    return {
      id: place.id,
      primary: place.names?.primary || place.id,
      chip: place.chip?.value || 'Unknown',
      summary: place.summary || '',
      names,
      normalizedNames,
      searchText: normalizedNames.join(' '),
    };
  });

const scoreMatch = (normalizedNames, query) => {
  let score = 0;
  normalizedNames.forEach(name => {
    if (name === query) {
      score = Math.max(score, 3);
    } else if (name.startsWith(query)) {
      score = Math.max(score, 2);
    } else if (name.includes(query)) {
      score = Math.max(score, 1);
    }
  });
  return score;
};

export const searchPlaces = (query, index, limit = 6) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  return index
    .map(entry => ({
      ...entry,
      score: scoreMatch(entry.normalizedNames, normalizedQuery),
    }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.primary.localeCompare(b.primary))
    .slice(0, limit);
};
