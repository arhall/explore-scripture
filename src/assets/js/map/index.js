import {
  clampStopIndex,
  createUrlFromState,
  getInitialState,
  persistState,
  updateUrlState,
} from './state.js';
import { buildSearchIndex, searchPlaces } from './search.js';
import {
  buildChurchesGeojson,
  buildJourneyGeojson,
  ensureMapLayers,
  LAYER_IDS,
  setLayerVisibility,
  setSelectedSegment,
  setSelectedStop,
  updateChurchSources,
  updateJourneySources,
} from './render.js';

const MAPLIBRE_VERSION = '3.6.1';
const MAPLIBRE_CDN = `https://cdn.jsdelivr.net/npm/maplibre-gl@${MAPLIBRE_VERSION}/dist`;

const elements = {
  map: document.getElementById('map'),
  journeyTitle: document.getElementById('journeyTitle'),
  journeyMeta: document.getElementById('journeyMeta'),
  stopList: document.getElementById('mapStopList'),
  placeCard: document.getElementById('mapPlaceCard'),
  confidence: document.getElementById('mapConfidence'),
  searchInput: document.getElementById('mapSearchInput'),
  searchResults: document.getElementById('mapSearchResults'),
  layersButton: document.querySelector('[data-action="layers"]'),
  layersPopover: document.getElementById('mapLayersPopover'),
  anchorButton: document.querySelector('[data-action="anchor-view"]'),
  toast: document.getElementById('mapToast'),
  churchList: document.getElementById('mapChurchList'),
  churchProfile: document.getElementById('mapChurchProfile'),
};

if (!elements.map) {
  throw new Error('[Map] Map container not found');
}

const getCssVar = (name, fallback) => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const theme = {
  accent: getCssVar('--accent', '#3b82f6'),
  warning: getCssVar('--warning', '#f59e0b'),
  textSecondary: getCssVar('--text-secondary', '#475569'),
  background: getCssVar('--bg', '#ffffff'),
};

const loadJson = async url => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return response.json();
};

const showToast = message => {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.add('visible');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    elements.toast.classList.remove('visible');
  }, 2400);
};

const loadExternalScript = src =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)));
    document.head.appendChild(script);
  });

const initializeMaplibre = async () => {
  if (window.maplibregl) {
    return window.maplibregl;
  }

  await loadExternalScript(`${MAPLIBRE_CDN}/maplibre-gl.js`);

  if (!window.maplibregl) {
    throw new Error('MapLibre failed to load');
  }

  const workerScriptUrl = `${MAPLIBRE_CDN}/maplibre-gl-csp-worker.js`;
  try {
    const response = await fetch(workerScriptUrl, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Worker fetch failed: ${response.status}`);
    }
    const workerSource = await response.text();
    const workerBlob = new Blob([workerSource], { type: 'application/javascript' });
    window.maplibregl.workerUrl = URL.createObjectURL(workerBlob);
  } catch (error) {
    console.warn('[Map] Falling back to CDN worker URL', error);
    window.maplibregl.workerUrl = workerScriptUrl;
  }
  return window.maplibregl;
};

const formatScriptureRefs = refs => {
  if (!refs || refs.length === 0) return '';
  return refs.join(' • ');
};

let selectStop = () => {};
let playInterval = null;
let anchorBounds = null;

const getAnchorPadding = () => {
  const isNarrow = window.innerWidth < 980;
  const rightPad = isNarrow ? 80 : 360;
  return { top: 80, bottom: 120, left: 80, right: rightPad };
};

const buildStops = (journey, placesById) =>
  journey.stops
    .map((stop, index) => {
      const place = placesById.get(stop.place_id);
      if (!place) return null;
      return {
        stopIndex: index,
        place,
        scriptureRefs: stop.scripture_refs?.length ? stop.scripture_refs : place.scripture_refs || [],
      };
    })
    .filter(Boolean);

const updateJourneyHeader = (journey, stops) => {
  if (elements.journeyTitle) elements.journeyTitle.textContent = journey.name;
  if (elements.journeyMeta) {
    elements.journeyMeta.textContent = `${journey.summary} • ${stops.length} stops`;
  }
};

const renderStopList = (stops, selectedIndex) => {
  if (!elements.stopList) return;
  elements.stopList.innerHTML = '';
  stops.forEach(stop => {
    const li = document.createElement('li');
    li.className = 'map-stop';
    if (stop.stopIndex === selectedIndex) li.classList.add('active');

    const card = document.createElement('div');
    card.className = 'map-stop-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-selected', stop.stopIndex === selectedIndex ? 'true' : 'false');
    card.dataset.stopIndex = String(stop.stopIndex);

    card.innerHTML = `
      <div class="map-stop-header">
        <span class="map-stop-name">${stop.place.names?.primary || stop.place.id}</span>
        <span class="map-stop-tag">${stop.place.chip?.value || 'Region'}</span>
      </div>
      <p class="map-stop-ref">${formatScriptureRefs(stop.scriptureRefs)}</p>
      <div class="map-stop-actions">
        <button class="map-action small" type="button" data-action="read" data-stop-index="${stop.stopIndex}">
          Read
        </button>
        <button class="map-action small" type="button" data-action="focus" data-stop-index="${stop.stopIndex}">
          Focus
        </button>
        <button class="map-action small" type="button" data-action="bookmark" data-stop-index="${stop.stopIndex}">
          Bookmark
        </button>
      </div>
    `;

    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectStop(stop.stopIndex, { focus: true });
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const next = Math.min(stops.length - 1, stop.stopIndex + 1);
        selectStop(next, { focus: true });
        focusStopCard(next);
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prev = Math.max(0, stop.stopIndex - 1);
        selectStop(prev, { focus: true });
        focusStopCard(prev);
      }
    });

    li.appendChild(card);
    elements.stopList.appendChild(li);
  });
};

const focusStopCard = stopIndex => {
  const card = elements.stopList?.querySelector(`.map-stop-card[data-stop-index="${stopIndex}"]`);
  if (card) card.focus();
};

const renderPlaceCard = (stop, options = {}) => {
  if (!elements.placeCard) return;
  if (!stop) {
    elements.placeCard.innerHTML = '<div class="map-place-empty">Select a stop to see details.</div>';
    return;
  }

  const { place, scriptureRefs } = stop;
  const showActions = options.showActions ?? true;
  const isSearchResult = options.isSearchResult ?? false;
  const subtitle = place.chip?.value || 'Region';
  const confidence = place.confidence?.level ? place.confidence.level.toUpperCase() : 'HIGH';
  const summary = place.summary || 'No summary available yet.';

  elements.placeCard.innerHTML = `
    <div class="map-place-header">
      <div class="map-place-name">${place.names?.primary || place.id}</div>
      <div class="map-place-chip">${subtitle}</div>
    </div>
    <div class="map-place-meta">Confidence: ${confidence}${isSearchResult ? ' • Search result' : ''}</div>
    <div class="map-place-meta">${formatScriptureRefs(scriptureRefs)}</div>
    <div class="map-place-meta">${summary}</div>
    ${
      showActions && Number.isInteger(stop.stopIndex)
        ? `
          <div class="map-place-actions">
            <button class="map-action small" type="button" data-action="read" data-stop-index="${stop.stopIndex}">
              Read
            </button>
            <button class="map-action small" type="button" data-action="focus" data-stop-index="${stop.stopIndex}">
              Focus
            </button>
            <button class="map-action small" type="button" data-action="bookmark" data-stop-index="${stop.stopIndex}">
              Bookmark
            </button>
          </div>
        `
        : ''
    }
  `;
};

const renderChurchList = (churches, placesById) => {
  if (!elements.churchList) return;
  elements.churchList.innerHTML = '';
  churches.forEach(church => {
    const placeName = church.place_id ? placesById.get(church.place_id)?.names?.primary : null;
    const button = document.createElement('button');
    button.className = 'map-church-item';
    button.type = 'button';
    button.dataset.churchId = church.id;
    button.innerHTML = `
      <strong>${church.name}</strong>
      <span>${placeName || ''}</span>
    `;
    elements.churchList.appendChild(button);
  });
};

const renderChurchProfile = (church, placesById) => {
  if (!elements.churchProfile) return;
  if (!church) {
    elements.churchProfile.setAttribute('hidden', '');
    elements.churchProfile.innerHTML = '';
    return;
  }
  if (elements.churchList) {
    elements.churchList.setAttribute('hidden', '');
  }
  const placeName = church.place_id ? placesById.get(church.place_id)?.names?.primary : '';
  const passages = (church.key_passages || [])
    .map(
      passage =>
        `<a href="${passage.link}" target="_blank" rel="noopener">${passage.ref}</a>`
    )
    .join(' • ');

  elements.churchProfile.innerHTML = `
    <div class="map-place-header">
      <div class="map-place-name">${church.name}</div>
      <div class="map-place-chip">Church</div>
    </div>
    <div class="map-place-meta">${placeName}</div>
    <div class="map-place-meta">${church.summary}</div>
    <div class="map-place-meta">Key passages: ${passages || '—'}</div>
  `;
  elements.churchProfile.removeAttribute('hidden');
};

const updateConfidenceBadge = (journey, stopIndex, placesById) => {
  if (!elements.confidence) return;
  const stop = journey.stops[stopIndex];
  if (!stop) return;
  const place = placesById.get(stop.place_id);
  const placeLevel = place?.confidence?.level || 'high';
  const segment = stopIndex > 0 ? journey.segments[stopIndex - 1] : null;
  const segmentLevel = segment?.confidence?.level || null;

  const label = segmentLevel
    ? `Confidence: ${placeLevel.toUpperCase()} (place) • ${segmentLevel.toUpperCase()} (segment)`
    : `Confidence: ${placeLevel.toUpperCase()} (place)`;
  elements.confidence.textContent = label;
};

const buildAnchorCoords = (state, journey, placesById, churches) => {
  const coords = [];
  const includeJourneys = state.layers?.journeys !== false;
  const includeChurches = state.layers?.churches === true;

  if (includeJourneys && journey?.stops?.length) {
    journey.stops.forEach(stop => {
      const place = placesById.get(stop.place_id);
      if (place?.coords) coords.push(place.coords);
    });
  }

  if (includeChurches) {
    churches.forEach(church => {
      const place = church.place_id ? placesById.get(church.place_id) : null;
      const coordsCandidate = church.coords || place?.coords;
      if (coordsCandidate) coords.push(coordsCandidate);
    });
  }

  if (coords.length === 0 && journey?.stops?.length) {
    journey.stops.forEach(stop => {
      const place = placesById.get(stop.place_id);
      if (place?.coords) coords.push(place.coords);
    });
  }

  return coords;
};

const updateAnchorBounds = (maplibregl, map, coords, { animate } = {}) => {
  if (!coords || coords.length === 0) return;
  const bounds = coords.reduce(
    (acc, coord) => acc.extend(coord),
    new maplibregl.LngLatBounds(coords[0], coords[0])
  );
  anchorBounds = bounds;
  if (animate) {
    map.fitBounds(bounds, { padding: getAnchorPadding(), duration: 700 });
  }
};

const syncState = state => {
  updateUrlState(state);
  persistState(state);
};

const setLayerState = (map, state) => {
  const journeyLayers = [
    LAYER_IDS.segments,
    LAYER_IDS.segmentsLow,
    LAYER_IDS.segmentSelected,
    LAYER_IDS.stopsLow,
    LAYER_IDS.stops,
    LAYER_IDS.stopSelected,
  ];
  const modernLabelLayers = [LAYER_IDS.modernLabels];
  const churchLayers = [LAYER_IDS.churches];

  setLayerVisibility(map, journeyLayers, state.layers.journeys);
  setLayerVisibility(map, modernLabelLayers, state.layers.journeys && state.layers.modern_labels);
  setLayerVisibility(map, churchLayers, state.layers.churches);
};

const attachLayerToggleHandlers = (state, getAnchorCoords) => {
  if (!elements.layersPopover) return;
  const toggles = elements.layersPopover.querySelectorAll('input[data-layer]');
  toggles.forEach(toggle => {
    toggle.checked = Boolean(state.layers[toggle.dataset.layer]);
    toggle.addEventListener('change', () => {
      state.layers[toggle.dataset.layer] = toggle.checked;
      if (window.mapInstance) {
        setLayerState(window.mapInstance, state);
      }
      if (window.mapInstance && window.maplibregl && typeof getAnchorCoords === 'function') {
        const coords = getAnchorCoords();
        updateAnchorBounds(window.maplibregl, window.mapInstance, coords, { animate: false });
      }
      syncState(state);
    });
  });
};

const toggleLayersPopover = open => {
  if (!elements.layersPopover || !elements.layersButton) return;
  const shouldOpen = open ?? elements.layersPopover.hasAttribute('hidden');
  if (shouldOpen) {
    elements.layersPopover.removeAttribute('hidden');
    elements.layersButton.setAttribute('aria-expanded', 'true');
  } else {
    elements.layersPopover.setAttribute('hidden', '');
    elements.layersButton.setAttribute('aria-expanded', 'false');
  }
};

const handleBookmark = (state, stop, labelPrefix) => {
  const url = createUrlFromState({ ...state, stopIndex: stop.stopIndex });
  const title = stop.place.names?.primary || stop.place.id;
  const subtitle = `${labelPrefix} • ${stop.place.chip?.value || 'Region'}`;
  const payload = {
    title,
    subtitle,
    url,
    type: 'map-place',
    data: { place_id: stop.place.id },
  };

  if (typeof window.isBookmarked === 'function' && window.isBookmarked(url)) {
    showToast('Already saved in Quick Access.');
    return;
  }

  if (typeof window.toggleBookmark === 'function') {
    window.toggleBookmark(payload);
    showToast('Saved to Quick Access → Bookmarks');
    return;
  }

  try {
    const existing = JSON.parse(localStorage.getItem('bookmarkedItems') || '[]');
    existing.push(payload);
    localStorage.setItem('bookmarkedItems', JSON.stringify(existing));
    showToast('Saved to Quick Access → Bookmarks');
  } catch (error) {
    console.warn('[Map] Failed to save bookmark', error);
  }
};

const handleBookmarkView = state => {
  const url = createUrlFromState(state);
  const payload = {
    title: 'Map view',
    subtitle: `${state.journeyId.replace('jn_', '').replace(/_/g, ' ')} • stop ${state.stopIndex + 1}`,
    url,
    type: 'map-view',
    data: { journey_id: state.journeyId, stop_index: state.stopIndex },
  };

  if (typeof window.isBookmarked === 'function' && window.isBookmarked(url)) {
    showToast('Already saved in Quick Access.');
    return;
  }

  if (typeof window.toggleBookmark === 'function') {
    window.toggleBookmark(payload);
    showToast('Saved view to Quick Access → Bookmarks');
    return;
  }

  try {
    const existing = JSON.parse(localStorage.getItem('bookmarkedItems') || '[]');
    existing.push(payload);
    localStorage.setItem('bookmarkedItems', JSON.stringify(existing));
    showToast('Saved view to Quick Access → Bookmarks');
  } catch (error) {
    console.warn('[Map] Failed to save bookmark', error);
  }
};

const init = async () => {
  const [{ places }, { journeys }, { churches }] = await Promise.all([
    loadJson('/assets/map/places.v1.json'),
    loadJson('/assets/map/journeys.v1.json'),
    loadJson('/assets/map/churches.v1.json'),
  ]);

  const placesById = new Map(places.map(place => [place.id, place]));
  const journeysById = new Map(journeys.map(journey => [journey.id, journey]));

  const searchIndex = buildSearchIndex(places);

  const state = getInitialState();
  if (!journeysById.has(state.journeyId)) {
    state.journeyId = journeys[0]?.id;
  }

  let currentJourney = journeysById.get(state.journeyId);
  let stops = buildStops(currentJourney, placesById);
  state.stopIndex = clampStopIndex(state.stopIndex, stops.length);

  updateJourneyHeader(currentJourney, stops);
  renderStopList(stops, state.stopIndex);
  renderPlaceCard(stops[state.stopIndex]);
  updateConfidenceBadge(currentJourney, state.stopIndex, placesById);
  renderChurchList(churches, placesById);

  const getAnchorCoords = () =>
    buildAnchorCoords(state, currentJourney, placesById, churches);

  attachLayerToggleHandlers(state, getAnchorCoords);

  let map;
  let maplibregl;
  const hasStoredView =
    Array.isArray(state.center) &&
    state.center.length === 2 &&
    typeof state.zoom === 'number' &&
    Number.isFinite(state.zoom) &&
    state.zoom > 0.1;
  try {
    maplibregl = await initializeMaplibre();
    window.maplibregl = maplibregl;
    const initialStop = stops[state.stopIndex];
    const initialCenter = hasStoredView
      ? state.center
      : initialStop?.place?.coords || [32.0, 37.5];
    const initialZoom = hasStoredView ? state.zoom : 5.2;

    map = new maplibregl.Map({
      container: elements.map,
      style: '/assets/map/styles/v1.json',
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: true,
    });

    window.mapInstance = map;

    map.on('load', () => {
      ensureMapLayers(map, theme);

      const journeyGeojson = buildJourneyGeojson(currentJourney, placesById);
      updateJourneySources(map, journeyGeojson);

      const churchesGeojson = buildChurchesGeojson(churches, placesById);
      updateChurchSources(map, churchesGeojson);

      setSelectedStop(map, state.stopIndex);
      setSelectedSegment(map, state.stopIndex > 0 ? state.stopIndex - 1 : -1);
      setLayerState(map, state);

      const anchorCoords = getAnchorCoords();
      updateAnchorBounds(maplibregl, map, anchorCoords, { animate: !hasStoredView });
    });

    window.addEventListener('resize', () => {
      if (!map || !anchorBounds) return;
      map.fitBounds(anchorBounds, { padding: getAnchorPadding(), duration: 0 });
    });

    map.on('moveend', () => {
      const center = map.getCenter();
      state.center = [Number(center.lng.toFixed(4)), Number(center.lat.toFixed(4))];
      state.zoom = Number(map.getZoom().toFixed(2));
      syncState(state);
    });

    map.on('click', LAYER_IDS.stops, event => {
      const feature = event.features?.[0];
      if (!feature) return;
      const stopIndex = Number(feature.properties?.stop_index);
      if (Number.isInteger(stopIndex)) {
        selectStop(stopIndex, { focus: true });
      }
    });

    map.on('mouseenter', LAYER_IDS.stops, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', LAYER_IDS.stops, () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('click', LAYER_IDS.churches, event => {
      const feature = event.features?.[0];
      const churchId = feature?.properties?.church_id;
      if (!churchId) return;
      const church = churches.find(item => item.id === churchId);
      if (church) {
        renderChurchProfile(church, placesById);
        if (feature.geometry?.coordinates) {
          map.flyTo({ center: feature.geometry.coordinates, zoom: Math.max(map.getZoom(), 6.5) });
        }
      }
    });

    map.on('mouseenter', LAYER_IDS.churches, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', LAYER_IDS.churches, () => {
      map.getCanvas().style.cursor = '';
    });
  } catch (error) {
    console.error('[Map] Failed to initialize MapLibre', error);
    elements.map.innerHTML = '<div class="map-place-empty">Map failed to load.</div>';
  }

  const selectJourney = journeyId => {
    if (playInterval) {
      stopPlayback();
    }
    const journey = journeysById.get(journeyId);
    if (!journey) return;

    currentJourney = journey;
    state.journeyId = journeyId;
    stops = buildStops(currentJourney, placesById);
    state.stopIndex = clampStopIndex(0, stops.length);

    updateJourneyHeader(currentJourney, stops);
    renderStopList(stops, state.stopIndex);
    renderPlaceCard(stops[state.stopIndex]);
    updateConfidenceBadge(currentJourney, state.stopIndex, placesById);

    if (map) {
      const journeyGeojson = buildJourneyGeojson(currentJourney, placesById);
      updateJourneySources(map, journeyGeojson);
      setSelectedStop(map, state.stopIndex);
      setSelectedSegment(map, -1);
      if (maplibregl) {
        const anchorCoords = getAnchorCoords();
        updateAnchorBounds(maplibregl, map, anchorCoords, { animate: true });
      }
      setLayerState(map, state);
    }

    document.querySelectorAll('.map-pill').forEach(button => {
      button.classList.toggle('active', button.dataset.journey === journeyId);
    });

    syncState(state);
  };

  selectStop = (stopIndex, options = {}) => {
    state.stopIndex = clampStopIndex(stopIndex, stops.length);
    renderStopList(stops, state.stopIndex);
    renderPlaceCard(stops[state.stopIndex]);
    updateConfidenceBadge(currentJourney, state.stopIndex, placesById);

    if (map) {
      setSelectedStop(map, state.stopIndex);
      setSelectedSegment(map, state.stopIndex > 0 ? state.stopIndex - 1 : -1);
      if (options.focus) {
        const coords = stops[state.stopIndex]?.place?.coords;
        if (coords) {
          map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 6.3) });
        }
      }
    }

    syncState(state);
  };

  const triggerAction = (action, stopIndex) => {
    const stop = stops[stopIndex];
    if (!stop) return;

    if (action === 'read') {
      const refs = stop.scriptureRefs?.[0] || stop.place.scripture_refs?.[0];
      if (refs) {
        const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(refs)}`;
        window.open(url, '_blank', 'noopener');
      }
      return;
    }

    if (action === 'focus') {
      selectStop(stopIndex, { focus: true });
      return;
    }

    if (action === 'bookmark') {
      handleBookmark(state, stop, 'Map');
    }
  };

  const playButton = document.querySelector('[data-action="play"]');
  const startPlayback = () => {
    if (playButton) playButton.setAttribute('aria-pressed', 'true');
    playButton?.classList.add('active');
    playButton.textContent = 'Pause';
    playButton?.setAttribute('data-playing', 'true');
    playInterval = window.setInterval(() => {
      const next = state.stopIndex + 1;
      if (next >= stops.length) {
        stopPlayback();
        return;
      }
      selectStop(next, { focus: true });
    }, 2500);
  };

  const stopPlayback = () => {
    if (playButton) playButton.setAttribute('aria-pressed', 'false');
    playButton?.classList.remove('active');
    playButton.textContent = 'Play';
    playButton?.removeAttribute('data-playing');
    window.clearInterval(playInterval);
  };

  document.querySelectorAll('.map-pill').forEach(button => {
    button.addEventListener('click', () => {
      selectJourney(button.dataset.journey);
    });
    if (button.dataset.journey === state.journeyId) {
      button.classList.add('active');
    }
  });

  document.querySelector('[data-action="prev"]')?.addEventListener('click', () => {
    selectStop(Math.max(0, state.stopIndex - 1), { focus: true });
  });

  document.querySelector('[data-action="next"]')?.addEventListener('click', () => {
    selectStop(Math.min(stops.length - 1, state.stopIndex + 1), { focus: true });
  });

  playButton?.addEventListener('click', () => {
    const isPlaying = playButton.getAttribute('data-playing') === 'true';
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  });

  elements.stopList?.addEventListener('click', event => {
    const actionButton = event.target.closest('[data-action]');
    if (actionButton && actionButton.dataset.action) {
      event.stopPropagation();
      const action = actionButton.dataset.action;
      const stopIndex = Number(actionButton.dataset.stopIndex);
      if (Number.isInteger(stopIndex)) triggerAction(action, stopIndex);
      return;
    }

    const card = event.target.closest('.map-stop-card');
    if (!card) return;
    const stopIndex = Number(card.dataset.stopIndex);
    if (Number.isInteger(stopIndex)) {
      selectStop(stopIndex, { focus: true });
    }
  });

  elements.placeCard?.addEventListener('click', event => {
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;
    const action = actionButton.dataset.action;
    const stopIndex = Number(actionButton.dataset.stopIndex);
    if (Number.isInteger(stopIndex)) triggerAction(action, stopIndex);
  });

  elements.searchInput?.addEventListener('input', event => {
    const value = event.target.value;
    const results = searchPlaces(value, searchIndex, 6);
    if (!elements.searchResults) return;

    if (results.length === 0) {
      elements.searchResults.classList.remove('active');
      elements.searchResults.innerHTML = '';
      return;
    }

    elements.searchResults.innerHTML = '';
    results.forEach(result => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'map-search-item';
      button.dataset.placeId = result.id;
      button.innerHTML = `${result.primary}<span>${result.chip}</span>`;
      elements.searchResults.appendChild(button);
    });
    elements.searchResults.classList.add('active');
  });

  elements.searchResults?.addEventListener('click', event => {
    const button = event.target.closest('.map-search-item');
    if (!button) return;
    const placeId = button.dataset.placeId;
    const place = placesById.get(placeId);
    if (!place) return;

    const stopIndex = stops.findIndex(stop => stop.place.id === placeId);
    if (stopIndex >= 0) {
      selectStop(stopIndex, { focus: true });
    } else {
      const stop = { stopIndex: null, place, scriptureRefs: place.scripture_refs || [] };
      renderPlaceCard(stop, { isSearchResult: true, showActions: false });
      updateConfidenceBadge(currentJourney, state.stopIndex, placesById);
      if (map && place.coords) {
        map.flyTo({ center: place.coords, zoom: 6.2 });
      }
    }

    elements.searchResults.classList.remove('active');
    elements.searchInput.value = '';
  });

  elements.searchInput?.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') {
      const firstResult = elements.searchResults?.querySelector('.map-search-item');
      if (firstResult) {
        event.preventDefault();
        firstResult.focus();
      }
    }
  });

  document.addEventListener('click', event => {
    if (elements.searchResults && !elements.searchResults.contains(event.target)) {
      if (event.target !== elements.searchInput) {
        elements.searchResults.classList.remove('active');
      }
    }

    if (elements.layersPopover && elements.layersButton) {
      if (
        !elements.layersPopover.contains(event.target) &&
        !elements.layersButton.contains(event.target)
      ) {
        toggleLayersPopover(false);
      }
    }
  });

  elements.layersButton?.addEventListener('click', () => {
    toggleLayersPopover();
  });

  elements.anchorButton?.addEventListener('click', () => {
    if (!map || !maplibregl) return;
    if (!anchorBounds) {
      const coords = getAnchorCoords();
      updateAnchorBounds(maplibregl, map, coords, { animate: true });
      return;
    }
    map.fitBounds(anchorBounds, { padding: getAnchorPadding(), duration: 700 });
  });

  elements.layersPopover?.addEventListener('click', event => {
    const closeButton = event.target.closest('[data-action="close-layers"]');
    if (closeButton) {
      toggleLayersPopover(false);
    }
  });

  document.querySelector('[data-action="toggle-church-list"]')?.addEventListener('click', () => {
    if (!elements.churchList) return;
    const isHidden = elements.churchList.hasAttribute('hidden');
    if (isHidden) {
      elements.churchList.removeAttribute('hidden');
      elements.churchProfile?.setAttribute('hidden', '');
    } else {
      elements.churchList.setAttribute('hidden', '');
    }
  });

  elements.churchList?.addEventListener('click', event => {
    const button = event.target.closest('.map-church-item');
    if (!button) return;
    const churchId = button.dataset.churchId;
    const church = churches.find(item => item.id === churchId);
    if (!church) return;
    renderChurchProfile(church, placesById);
    const coords = church.place_id ? placesById.get(church.place_id)?.coords : null;
    if (map && coords) {
      map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 6.2) });
    }
  });

  document.querySelector('[data-action="bookmark-view"]')?.addEventListener('click', () => {
    handleBookmarkView(state);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      toggleLayersPopover(false);
      elements.searchResults?.classList.remove('active');
    }
  });

  syncState(state);
};

init().catch(error => {
  console.error('[Map] Failed to initialize map page', error);
});
