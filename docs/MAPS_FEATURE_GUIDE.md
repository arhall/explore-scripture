# Maps Feature Guide (MVP)

## Product Vision
Map turns "where" into a first-class study tool. Explore Scripture already helps people read with
focus and control (typography, spacing, quick access). Map adds the missing spatial layer: when a
passage mentions Antioch, Cyprus, Pisidian Antioch, Iconium, Lystra, and Derbe, users can see the
relationships (distance, terrain, regions, provinces), understand why routes mattered, and connect
scattered references into a coherent mental model.

For casual readers, Map is a guided companion: tap "Journey 1" and step through Paul's story like a
visual timeline with short, readable panels. For deep study, Map becomes a research surface: filter
by era, compare overlays (Roman provinces vs. church communities), inspect source confidence, and
save/share a particular view (layers + era + route + stops). The result is a study experience that
stays readable-first but offers spatial depth when you want it.

## MVP Focus: Paul's Journeys (Acts 13-28)

### Entry points
1. **Top Nav: Map**
   - New global destination: Map -> Paul's Journeys (MVP).
   - Includes "Ancient Churches" as a primary toggle inside Map (not a separate product area).
2. **In-page CTA: View on Map**
   - Acts book page: "View Paul's Journeys on Map".
   - Acts chapter pages (Acts 13-28): "View this chapter's locations".
3. **Inline chips (optional MVP-lite)**
   - Place-name chips in the text or footnotes: "Antioch (Syria)" -> mini place card -> "Open on Map".

### Key interactions (MVP)
**A. Journey selection**
- Segmented control or pills: Journey 1 / Journey 2 / Journey 3 / To Rome.
- Selecting one:
  - Draws route polyline.
  - Highlights ordered stops.
  - Opens side panel to "Journey Overview".

**B. Step through route stops**
- Side panel shows a vertical stop list:
  - Stop name (ancient + modern).
  - Region/province tag.
  - Primary references (e.g., Acts 13:4-12).
- Controls:
  - Next / Previous stop.
  - Play (auto-advance with gentle pacing; optional).
  - Focus on map (centers and zooms to stop).

**C. Scripture references per stop + jump back**
- Each stop card includes:
  - Read button -> opens the relevant Acts passage in the reader (same tab) with a back-to-map breadcrumb.
  - Open split (nice-to-have): map remains, scripture opens in a panel overlay on wide screens.

**D. Ancient churches in the MVP**
- Toggle: Churches.
- When on:
  - Markers appear for key early church communities relevant to Acts/Paul (e.g., Antioch, Corinth,
    Ephesus, Philippi, Thessalonica, Rome).
  - Clicking a church marker opens a Church Profile Panel:
    - Who/what summary.
    - Key passages (Acts + epistles tied to that church).
    - Timeline hint (earliest mention + later letters).
    - Bookmark action.

**E. Smart defaults to avoid overwhelm**
- If the user opens Map from an Acts chapter page:
  - Map opens filtered to that chapter's stops.
  - Journey pill auto-selected when unambiguous.

## Information Architecture

### Map landing page (MVP)
- Header: "Map"
  - Search (ancient/modern).
  - Quick toggles: Journeys, Churches, Modern labels.
- Primary content cards:
  1. Paul's Journeys (MVP) with journey pills + "Start at Acts 13".
  2. Ancient Churches (MVP subset) with list view and "Show all on map".
- Secondary placeholders (future, gated):
  - Tribes of Israel (Coming soon).
  - Empires and Provinces (Coming soon).

### Map embedded within a Book page (Acts)
- Book header includes a Map module:
  - "Paul's Journeys: Explore Acts 13-28".
  - Quick actions: Open Map / Jump to current chapter's places.
  - "Continue where you left off" if recent activity exists.

### Map embedded within a Chapter page
- Compact "Places in this chapter" component:
  - 3-8 place chips + View on Map.
- Map opens with:
  - Chapter filter enabled.
  - Side panel tab "Chapter Places" (vs. Journey Overview).

### Ties into Bookmarks and Recent
- Bookmarkable entities:
  - Place (e.g., Ephesus).
  - Journey (Journey 3).
  - View state (layers + era + selected stop + zoom/center).
- Recent captures:
  - Last opened place card.
  - Last journey + stop.
  - Last layer configuration.

## UI Layout (text wireframes)

### Desktop (side panel)
- Top Nav: Sections | Map | Genealogies | Links
- Header controls: Search, Journeys, Churches, Layers
- Left side panel: tabs, journey pills, stop list, Read/Focus/Bookmark actions
- Right side: Map canvas (MapLibre/Leaflet)
- Legend drawer + Era selector (disabled in MVP but reserved)

### Mobile (bottom sheet)
- Top bar: Map (Close)
- Search
- Journey pills scroll
- Map canvas full height
- Bottom sheet (collapsed -> expanded):
  - Collapsed: Stop name + Next/Prev + Read
  - Expanded: list of stops + refs + churches tab + layers

## Layer System Design

### Layer categories + toggles
1. **Places**
   - Churches (markers with church profile)
   - Cities/Towns (general places)
   - Regions (labels; off by default in MVP)
   - Events (future)
2. **Journeys / Routes**
   - Paul's Journeys (MVP)
   - Future: Exodus, Conquest, Exile, Return, Jesus' movements
3. **Boundaries**
   - Tribal territories (multi-era)
   - Roman provinces (era-specific)
   - Empires (Assyrian/Babylonian/Persian/Greek extents)
4. **People groups / influence overlays**
   - Influence/extent polygons (always tied to sources + confidence)

### Preventing clutter
- Context-aware defaults (Acts = Journeys + Churches on; boundaries off).
- Zoom-based rendering (major cities at low zoom, minor stops at local zoom).
- Layer grouping + "Solo mode".
- Conflict resolution rules for overlapping boundaries and multiple candidate locations.

## Data Model (JSON/GeoJSON-friendly)

### Era ranges
- `era`: named key (e.g., `nt_acts`, `ot_conquest`).
- `date_range`: optional numeric bounds (`start_year`, `end_year`), BCE as negative.
- `era_tags`: array for filtering.

### Place schema (example)
```json
{
  "type": "Place",
  "id": "pl_ephesus",
  "names": {
    "primary": "Ephesus",
    "also_known_as": ["Efes", "Selcuk"],
    "display_modern": "near Selcuk, Turkey"
  },
  "location": {
    "type": "Point",
    "coordinates": [27.341, 37.939]
  },
  "confidence": {
    "level": "high",
    "notes": "Well-attested archaeological site"
  },
  "era_tags": ["nt_acts", "nt_epistles", "roman_imperial"],
  "scripture_refs": [
    {"ref": "Acts 19:1-41", "weight": 5},
    {"ref": "Eph 1:1", "weight": 3}
  ],
  "summary": "Major city in Roman Asia; significant center for Paul's ministry.",
  "links": {
    "internal": "/places/ephesus",
    "media": []
  }
}
```

### Journey schema (example)
```json
{
  "type": "Journey",
  "id": "jn_pauls_first",
  "name": "Paul's First Journey",
  "era": "nt_acts",
  "date_range": {"start_year": 46, "end_year": 48},
  "stops": [
    {
      "place_id": "pl_antioch_syria",
      "order": 1,
      "scripture_refs": ["Acts 13:1-3"]
    },
    {
      "place_id": "pl_seleucia",
      "order": 2,
      "scripture_refs": ["Acts 13:4"]
    }
  ],
  "route": {
    "type": "LineString",
    "coordinates": [[36.2, 36.2], [35.9, 36.1]]
  },
  "segments": [
    {
      "from_place_id": "pl_antioch_syria",
      "to_place_id": "pl_seleucia",
      "scripture_refs": ["Acts 13:4"],
      "confidence": {"level": "medium", "notes": "General route inferred from port travel"}
    }
  ]
}
```

### Boundary schema (example)
```json
{
  "type": "Boundary",
  "id": "bd_roman_asia_1c",
  "label": "Roman Province of Asia",
  "era": "nt_acts",
  "date_range": {"start_year": -27, "end_year": 100},
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[26.0, 39.0], [30.0, 39.0], [30.0, 36.0], [26.0, 36.0], [26.0, 39.0]]]
  },
  "confidence": {"level": "medium", "notes": "Provincial borders approximate; varied over time"},
  "sources": [{"label": "Academic Atlas A", "url": null}]
}
```

### Handling changes over time
- Store multiple boundary records with the same `family_id` but different `date_range` + geometry.
- Timeline slider filters to the best-matching record for the selected time.

## Roadmap

### Phase 1 (MVP)
- Paul's Journeys selector (J1/J2/J3/Rome) with stop list + Read jump.
- Church markers + church profile panels (minimal set).
- Search (ancient + modern name synonyms).
- Modern labels toggle.
- Bookmark place/journey/view state; Recent map activity.

**Risks**
- Route reconstruction disagreements -> label as representative + cite confidence.
- Name disambiguation (Antioch, multiple Pisidia) -> requires IDs + disambiguators.
- Performance on static hosting if GeoJSON grows -> chunking needed.

### Phase 2
- NT journeys + OT major routes (Exodus, exile, return).
- Events layer (key narrative events anchored to places).
- Shareable map links (permalink with view state).

### Phase 3
- Tribes of Israel through time.
- Timeline slider with era presets.
- Tribal territories layer with era-dependent polygons.

### Phase 4
- Empires/provinces overlays and influence views.
- Compare mode (side-by-side or swipe between eras).

## Edge Cases + Trust
- Confidence badges: High / Medium / Low on every place or boundary.
- Multiple candidate locations:
  - Default marker with badge count.
  - Candidate chooser with sources and passages.
  - User can pick a preferred model and save it.
- Scholarly reconstructions:
  - Treat as Map Models within layer groups (no separate settings page).
- Sources:
  - Each place/journey/boundary card includes a collapsible Sources section.

## Accessibility + Performance

### Accessibility
- Full keyboard navigation across controls, pills, and stop list.
- Screen reader support: announce selected stop and references.
- Non-map alternative: list/table view with references and Read links.

### Performance (static site)
- Lazy-load GeoJSON by feature type and era.
- Cache aggressively with versioned filenames.
- Keep MVP payload small (Paul's routes + 50-100 places).
- Prefer vector rendering for lines/polygons; cluster markers at low zoom.
