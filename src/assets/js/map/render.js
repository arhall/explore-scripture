const EMPTY_GEOJSON = {
  type: 'FeatureCollection',
  features: [],
};

export const LAYER_IDS = {
  segments: 'journey-segments',
  segmentsLow: 'journey-segments-low',
  segmentSelected: 'journey-segment-selected',
  stopsLow: 'journey-stops-low',
  stops: 'journey-stops',
  stopSelected: 'journey-stop-selected',
  modernLabels: 'journey-modern-labels',
  churches: 'churches',
};

const getPlaceCoords = (placesById, placeId) => {
  const place = placesById.get(placeId);
  if (!place || !Array.isArray(place.coords)) return null;
  return place.coords;
};

export const buildJourneyGeojson = (journey, placesById) => {
  if (!journey) return { stops: EMPTY_GEOJSON, segments: EMPTY_GEOJSON };

  const stops = journey.stops.map((stop, index) => {
    const place = placesById.get(stop.place_id);
    if (!place) return null;
    return {
      type: 'Feature',
      id: `stop-${journey.id}-${index}`,
      geometry: {
        type: 'Point',
        coordinates: place.coords,
      },
      properties: {
        stop_index: index,
        place_id: place.id,
        name: place.names?.primary || place.id,
        chip_value: place.chip?.value || '',
        confidence: place.confidence?.level || 'high',
        modern_label: place.names?.modern_label || '',
        scripture_refs: stop.scripture_refs || place.scripture_refs || [],
      },
    };
  });

  const segments = journey.segments.map((segment, index) => {
    const from = getPlaceCoords(placesById, segment.from_place_id);
    const to = getPlaceCoords(placesById, segment.to_place_id);
    if (!from || !to) return null;
    return {
      type: 'Feature',
      id: `segment-${journey.id}-${index}`,
      geometry: {
        type: 'LineString',
        coordinates: [from, to],
      },
      properties: {
        segment_index: index,
        confidence: segment.confidence?.level || 'high',
        from_place_id: segment.from_place_id,
        to_place_id: segment.to_place_id,
      },
    };
  });

  return {
    stops: {
      type: 'FeatureCollection',
      features: stops.filter(Boolean),
    },
    segments: {
      type: 'FeatureCollection',
      features: segments.filter(Boolean),
    },
  };
};

export const buildChurchesGeojson = (churches, placesById) => ({
  type: 'FeatureCollection',
  features: churches
    .map(church => {
      const place = church.place_id ? placesById.get(church.place_id) : null;
      const coords = church.coords || place?.coords;
      if (!coords) return null;
      return {
        type: 'Feature',
        id: `church-${church.id}`,
        geometry: {
          type: 'Point',
          coordinates: coords,
        },
        properties: {
          church_id: church.id,
          name: church.name,
          place_id: church.place_id || null,
        },
      };
    })
    .filter(Boolean),
});

export const ensureMapLayers = (map, theme) => {
  if (map.getSource('journey-stops')) return;

  map.addSource('journey-stops', {
    type: 'geojson',
    data: EMPTY_GEOJSON,
  });

  map.addSource('journey-segments', {
    type: 'geojson',
    data: EMPTY_GEOJSON,
  });

  map.addSource('churches', {
    type: 'geojson',
    data: EMPTY_GEOJSON,
  });

  map.addLayer({
    id: LAYER_IDS.segments,
    type: 'line',
    source: 'journey-segments',
    filter: ['!=', ['get', 'confidence'], 'low'],
    paint: {
      'line-color': theme.accent,
      'line-width': 3,
      'line-opacity': 0.9,
    },
  });

  map.addLayer({
    id: LAYER_IDS.segmentsLow,
    type: 'line',
    source: 'journey-segments',
    filter: ['==', ['get', 'confidence'], 'low'],
    paint: {
      'line-color': theme.warning,
      'line-width': 3,
      'line-opacity': 0.85,
      'line-dasharray': ['literal', [2, 2]],
    },
  });

  map.addLayer({
    id: LAYER_IDS.segmentSelected,
    type: 'line',
    source: 'journey-segments',
    filter: ['==', ['get', 'segment_index'], -1],
    paint: {
      'line-color': theme.accent,
      'line-width': 5,
      'line-opacity': 1,
    },
  });

  map.addLayer({
    id: LAYER_IDS.churches,
    type: 'circle',
    source: 'churches',
    paint: {
      'circle-color': theme.warning,
      'circle-radius': 5,
      'circle-stroke-width': 2,
      'circle-stroke-color': theme.background,
      'circle-opacity': 0.9,
    },
  });

  map.addLayer({
    id: LAYER_IDS.stopsLow,
    type: 'circle',
    source: 'journey-stops',
    filter: ['==', ['get', 'confidence'], 'low'],
    paint: {
      'circle-radius': 9,
      'circle-color': 'rgba(0, 0, 0, 0)',
      'circle-stroke-width': 2,
      'circle-stroke-color': theme.warning,
      'circle-stroke-opacity': 0.9,
    },
  });

  map.addLayer({
    id: LAYER_IDS.stops,
    type: 'circle',
    source: 'journey-stops',
    paint: {
      'circle-color': theme.accent,
      'circle-radius': 5,
      'circle-stroke-width': 2,
      'circle-stroke-color': theme.background,
    },
  });

  map.addLayer({
    id: LAYER_IDS.stopSelected,
    type: 'circle',
    source: 'journey-stops',
    filter: ['==', ['get', 'stop_index'], -1],
    paint: {
      'circle-color': theme.accent,
      'circle-radius': 7,
      'circle-stroke-width': 3,
      'circle-stroke-color': theme.background,
    },
  });

  map.addLayer({
    id: LAYER_IDS.modernLabels,
    type: 'symbol',
    source: 'journey-stops',
    filter: ['!=', ['get', 'modern_label'], ''],
    layout: {
      'text-field': ['get', 'modern_label'],
      'text-size': 12,
      'text-offset': [0, 1.1],
      'text-anchor': 'top',
      'text-optional': true,
    },
    paint: {
      'text-color': theme.textSecondary,
      'text-halo-color': theme.background,
      'text-halo-width': 1,
    },
  });
};

export const updateJourneySources = (map, journeyGeojson) => {
  const stopsSource = map.getSource('journey-stops');
  const segmentsSource = map.getSource('journey-segments');
  if (stopsSource) stopsSource.setData(journeyGeojson.stops);
  if (segmentsSource) segmentsSource.setData(journeyGeojson.segments);
};

export const updateChurchSources = (map, churchesGeojson) => {
  const churchesSource = map.getSource('churches');
  if (churchesSource) churchesSource.setData(churchesGeojson);
};

export const setSelectedStop = (map, stopIndex) => {
  if (!map.getLayer(LAYER_IDS.stopSelected)) return;
  map.setFilter(LAYER_IDS.stopSelected, ['==', ['get', 'stop_index'], stopIndex]);
};

export const setSelectedSegment = (map, segmentIndex) => {
  if (!map.getLayer(LAYER_IDS.segmentSelected)) return;
  map.setFilter(LAYER_IDS.segmentSelected, ['==', ['get', 'segment_index'], segmentIndex]);
};

export const setLayerVisibility = (map, layerIds, visible) => {
  const visibility = visible ? 'visible' : 'none';
  layerIds.forEach(layerId => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visibility);
    }
  });
};
