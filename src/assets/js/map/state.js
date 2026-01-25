const STORAGE_KEY = 'mapState.v1';

const DEFAULT_LAYERS = {
  journeys: true,
  churches: false,
  modern_labels: false,
  base_labels: true,
};

const DEFAULT_STATE = {
  journeyId: 'jn_pauls_first',
  stopIndex: 0,
  layers: { ...DEFAULT_LAYERS },
  center: null,
  zoom: null,
};

const toNumber = value => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseCenter = value => {
  if (!value) return null;
  const parts = value.split(',').map(part => Number(part));
  if (parts.length !== 2 || parts.some(part => !Number.isFinite(part))) return null;
  return [parts[0], parts[1]];
};

const parseLayers = value => {
  if (!value) return null;
  const set = new Set(value.split(',').map(item => item.trim()).filter(Boolean));
  const parsed = {
    journeys: set.has('journeys'),
    churches: set.has('churches'),
    modern_labels: set.has('modern_labels'),
  };
  if (set.has('base_labels')) parsed.base_labels = true;
  if (set.has('base_labels_off')) parsed.base_labels = false;
  return parsed;
};

export const getDefaultState = () => ({
  ...DEFAULT_STATE,
  layers: { ...DEFAULT_LAYERS },
});

export const parseUrlState = () => {
  const params = new URLSearchParams(window.location.search);
  const journeyId = params.get('journey');
  const stopIndex = toNumber(params.get('stop'));
  const layers = parseLayers(params.get('layers'));
  const zoom = toNumber(params.get('z'));
  const center = parseCenter(params.get('c'));

  return {
    journeyId: journeyId || null,
    stopIndex: Number.isInteger(stopIndex) ? stopIndex : null,
    layers,
    center,
    zoom,
  };
};

export const loadStoredState = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch (error) {
    console.warn('[Map] Failed to parse stored state', error);
    return null;
  }
};

export const normalizeState = state => {
  const normalized = {
    ...DEFAULT_STATE,
    ...state,
    layers: { ...DEFAULT_LAYERS, ...(state?.layers || {}) },
  };

  if (!Number.isInteger(normalized.stopIndex) || normalized.stopIndex < 0) {
    normalized.stopIndex = DEFAULT_STATE.stopIndex;
  }

  if (!Array.isArray(normalized.center) || normalized.center.length !== 2) {
    normalized.center = null;
  }

  if (typeof normalized.zoom !== 'number' || !Number.isFinite(normalized.zoom)) {
    normalized.zoom = null;
  }

  return normalized;
};

export const getInitialState = () => {
  const urlState = parseUrlState();
  const storedState = loadStoredState();
  return normalizeState({
    ...DEFAULT_STATE,
    ...(storedState || {}),
    ...(urlState || {}),
    layers: {
      ...DEFAULT_LAYERS,
      ...(storedState?.layers || {}),
      ...(urlState?.layers || {}),
    },
  });
};

export const formatLayersParam = layers => {
  if (!layers) return '';
  const params = [];
  if (layers.journeys) params.push('journeys');
  if (layers.churches) params.push('churches');
  if (layers.modern_labels) params.push('modern_labels');
  if (layers.base_labels === false) {
    params.push('base_labels_off');
  } else if (layers.base_labels === true) {
    params.push('base_labels');
  }
  return params.join(',');
};

export const createUrlFromState = state => {
  const params = new URLSearchParams();
  if (state.journeyId) params.set('journey', state.journeyId);
  if (Number.isInteger(state.stopIndex)) params.set('stop', String(state.stopIndex));
  if (state.center && state.center.length === 2) {
    params.set('c', `${state.center[0].toFixed(2)},${state.center[1].toFixed(2)}`);
  }
  if (typeof state.zoom === 'number' && Number.isFinite(state.zoom)) {
    params.set('z', state.zoom.toFixed(2));
  }
  const layersParam = formatLayersParam(state.layers || DEFAULT_LAYERS);
  if (layersParam) params.set('layers', layersParam);

  return `${window.location.pathname}?${params.toString()}`;
};

export const updateUrlState = state => {
  const next = createUrlFromState(state);
  window.history.replaceState({}, '', next);
};

export const persistState = state => {
  try {
    const payload = {
      journeyId: state.journeyId,
      stopIndex: state.stopIndex,
      layers: state.layers,
      center: state.center,
      zoom: state.zoom,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('[Map] Failed to persist state', error);
  }
};

export const clampStopIndex = (stopIndex, totalStops) => {
  if (!Number.isInteger(stopIndex)) return 0;
  if (stopIndex < 0) return 0;
  if (stopIndex >= totalStops) return Math.max(0, totalStops - 1);
  return stopIndex;
};
