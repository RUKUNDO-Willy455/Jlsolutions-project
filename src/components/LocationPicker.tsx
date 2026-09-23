import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface LocationPick {
  lat: number;
  lng: number;
  place: string;
}

export interface MapFocus {
  lat: number;
  lng: number;
  bounds?: { minLat: number; minLng: number; maxLat: number; maxLng: number };
}

interface Props {
  value: { lat: number; lng: number } | null;
  focus?: MapFocus | null;
  fill?: boolean;
  onChange: (pick: LocationPick | null) => void;
}

const RWANDA_BOUNDS: L.LatLngBoundsExpression = [
  [-2.95, 28.55],
  [-0.9, 31.45],
];
const RWANDA_CENTER: L.LatLngExpression = [-1.9441, 29.8739];
const RWANDA_VIEW: L.LatLngBoundsExpression = [
  [-2.85, 28.75],
  [-1.2, 30.95],
];
const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_OPTS: L.TileLayerOptions = {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: 'abc',
  maxZoom: 19,
};

const PIN = L.divIcon({
  className: 'loc-pin-wrap',
  html: '<div class="loc-pin"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface Poi {
  name: string;
  lat: number;
  lng: number;
}

const POI_DOT = L.divIcon({
  className: 'poi-dot-wrap',
  html: '<div class="poi-dot"></div>',
  iconSize: [9, 9],
  iconAnchor: [4.5, 4.5],
  tooltipAnchor: [0, -8],
});

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function fetchNearbyPois(lat: number, lng: number, radius: number): Promise<Poi[]> {
  const data = `[out:json][timeout:15];(nwr["shop"](around:${radius},${lat},${lng});nwr["amenity"](around:${radius},${lat},${lng});nwr["office"](around:${radius},${lat},${lng});nwr["tourism"](around:${radius},${lat},${lng});nwr["leisure"](around:${radius},${lat},${lng}););out center 60 tags;`;
  for (const ep of OVERPASS_ENDPOINTS) {
    try {
      const ctrl = new AbortController();
      const t = window.setTimeout(() => ctrl.abort(), 16000);
      const res = await fetch(`${ep}?data=${encodeURIComponent(data)}`, { signal: ctrl.signal });
      window.clearTimeout(t);
      if (!res.ok) continue;
      const json = (await res.json()) as {
        elements?: Array<{ lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }>;
      };
      const seen = new Set<string>();
      return (
        (json.elements ?? [])
          .map((e) => ({
            name: (e.tags?.name ?? '').trim(),
            lat: e.lat ?? e.center?.lat,
            lng: e.lon ?? e.center?.lon,
          }))
          .filter((p): p is Poi => !!p.name && typeof p.lat === 'number' && typeof p.lng === 'number')
          .filter((p) => {
            const k = `${p.lat.toFixed(3)},${p.lng.toFixed(3)}|${p.name}`;
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          })
          .slice(0, 36)
      );
    } catch {
      /* try next endpoint */
    }
  }
  return [];
}

function boundsRadius(b: { minLat: number; minLng: number; maxLat: number; maxLng: number }): number {
  const dLatKm = (b.maxLat - b.minLat) * 111;
  const dLngKm = (b.maxLng - b.minLng) * 111 * Math.cos(((b.minLat + b.maxLat) / 2) * (Math.PI / 180));
  const diag = Math.hypot(dLatKm, dLngKm);
  return Math.max(1500, Math.min(4000, diag * 0.55 * 1000));
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1`,
      { signal: ctrl.signal, headers: { Accept: 'application/json' } },
    );
    window.clearTimeout(t);
    if (!res.ok) return '';
    const data = (await res.json()) as { address?: Record<string, string>; name?: string };
    const a = data.address ?? {};
    const bit = (k: string) => (a[k] ? String(a[k]) : '');
    const parts = [
      bit('road') || bit('neighbourhood'),
      bit('suburb') || bit('village') || bit('quarter'),
      bit('town') || bit('city'),
      bit('county') || bit('state_district'),
      bit('state') === 'Rwanda' ? '' : bit('state'),
    ].filter(Boolean);
    return parts.join(', ') || data.name || '';
  } catch {
    return '';
  }
}

type TileState = 'loading' | 'ready' | 'error';

export default function LocationPicker({ value, focus, fill = false, onChange }: Props) {
  const mapWrap = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const poisLayerRef = useRef<L.LayerGroup | null>(null);
  const poiReq = useRef(0);
  const lastFly = useRef('');
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const [tileState, setTileState] = useState<TileState>('loading');
  onChangeRef.current = onChange;
  valueRef.current = value;

  const focusKey = focus
    ? `${focus.lat.toFixed(6)},${focus.lng.toFixed(6)}${
        focus.bounds
          ? `|${focus.bounds.minLat.toFixed(4)},${focus.bounds.minLng.toFixed(4)},${focus.bounds.maxLat.toFixed(4)},${focus.bounds.maxLng.toFixed(4)}`
          : ''
      }`
    : '';

  const emitPick = async (lat: number, lng: number) => {
    const place = await reverseGeocode(lat, lng);
    onChangeRef.current({ lat, lng, place });
  };

  const loadPois = async (lat: number, lng: number, radius: number) => {
    const req = ++poiReq.current;
    const pois = await fetchNearbyPois(lat, lng, radius);
    if (req !== poiReq.current) return;
    const layer = poisLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!pois.length) return;
    const m = mapRef.current;
    pois.forEach((p) => {
      const mk = L.marker([p.lat, p.lng], { icon: POI_DOT, interactive: true, keyboard: false });
      mk.bindTooltip(p.name, { direction: 'top', offset: [0, -6], opacity: 1, className: 'poi-tip' });
      mk.on('click', () => {
        if (m) m.flyTo([p.lat, p.lng], Math.max(m.getZoom(), 16), { duration: 0.8 });
      });
      mk.addTo(layer);
    });
  };

  const reloadTiles = () => {
    const m = mapRef.current;
    if (!m) return;
    setTileState('loading');
    m.eachLayer((l) => {
      if (l instanceof L.TileLayer) m.removeLayer(l);
    });
    const layer = L.tileLayer(TILE_URL, TILE_OPTS);
    layer.on('load', () => setTileState('ready'));
    layer.on('tileerror', () => setTileState((s) => (s === 'ready' ? s : 'error')));
    layer.addTo(m);
    window.setTimeout(() => m.invalidateSize(), 120);
  };

  useEffect(() => {
    const el = mapWrap.current;
    if (!el || mapRef.current) return;

    const base = valueRef.current;
    const map = L.map(el, {
      center: base ? [base.lat, base.lng] : RWANDA_CENTER,
      zoom: base ? 14 : 9,
      minZoom: 7,
      maxZoom: 18,
      maxBounds: RWANDA_BOUNDS,
      maxBoundsViscosity: 1,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomleft' }).addTo(map);
    poisLayerRef.current = L.layerGroup().addTo(map);

    const layer = L.tileLayer(TILE_URL, TILE_OPTS);
    layer.on('load', () => setTileState('ready'));
    layer.on('tileerror', () => setTileState((s) => (s === 'ready' ? s : 'error')));
    layer.addTo(map);

    if (base) {
      map.setView([base.lat, base.lng], 14);
    } else if (focus && focus.bounds) {
      map.fitBounds(
        [
          [focus.bounds.minLat, focus.bounds.minLng],
          [focus.bounds.maxLat, focus.bounds.maxLng],
        ],
        { padding: [28, 28] },
      );
    } else if (focus) {
      map.setView([focus.lat, focus.lng], 16);
    } else {
      map.fitBounds(RWANDA_VIEW, { padding: [24, 24] });
    }

    const syncMarker = (lat: number, lng: number, zoomIn: boolean) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        return;
      }
      const mk = L.marker([lat, lng], { icon: PIN, draggable: true }).addTo(map);
      mk.on('dragend', () => {
        const ll = mk.getLatLng();
        void emitPick(ll.lat, ll.lng);
      });
      markerRef.current = mk;
      if (zoomIn && map.getZoom() < 13) {
        map.setView([lat, lng], 13, { animate: true });
      }
    };

    map.on('click', (e: L.LeafletMouseEvent) => {
      syncMarker(e.latlng.lat, e.latlng.lng, true);
      void emitPick(e.latlng.lat, e.latlng.lng);
    });

    if (base) syncMarker(base.lat, base.lng, false);

    const t = window.setTimeout(() => map.invalidateSize(), 250);
    return () => {
      window.clearTimeout(t);
      poiReq.current += 1;
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      poisLayerRef.current = null;
    };
  }, [fill]);

  useEffect(() => {
    const m = mapRef.current;
    if (!m || !focus || !focusKey) return;
    if (lastFly.current === focusKey) return;
    lastFly.current = focusKey;
    if (focus.bounds) {
      m.fitBounds(
        [
          [focus.bounds.minLat, focus.bounds.minLng],
          [focus.bounds.maxLat, focus.bounds.maxLng],
        ],
        { padding: [28, 28], animate: true, duration: 0.6 },
      );
      void loadPois(focus.lat, focus.lng, boundsRadius(focus.bounds));
    } else {
      m.flyTo([focus.lat, focus.lng], Math.max(m.getZoom(), 16), { duration: 1 });
      void loadPois(focus.lat, focus.lng, 1100);
    }
  }, [focusKey, focus]);

  const statusPill = (
    <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
      {tileState === 'error' ? (
        <button
          type="button"
          onClick={reloadTiles}
          className="flex items-center gap-1.5 text-[0.6rem] tracking-[0.12em] uppercase text-red-300 bg-[rgba(9,9,9,0.82)] border border-red-800/50 px-3 py-1.5 rounded-[2px] hover:bg-[rgba(9,9,9,0.95)] transition-colors duration-200"
          style={{ fontFamily: 'DM Mono, Courier New, monospace' }}
        >
          Map tiles failed — Retry
        </button>
      ) : tileState === 'loading' ? (
        <span className="text-[0.6rem] tracking-[0.12em] uppercase text-[#aaa] bg-[rgba(9,9,9,0.82)] border border-[rgba(255,255,255,0.14)] px-3 py-1.5 rounded-[2px] animate-pulse" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
          Loading map…
        </span>
      ) : null}
    </div>
  );

  if (fill) {
    return (
      <div className="relative w-full h-full" style={{ background: '#0e0e0e' }}>
        <div ref={mapWrap} aria-label="Map of Rwanda — tap to place your precise location pin" className="loc-map absolute inset-0" />
        {statusPill}
        <div className="absolute bottom-3 right-3 z-[1000] max-w-[70%] pointer-events-none">
          <span className="text-[0.6rem] tracking-[0.12em] uppercase text-[#e6e6e6] bg-[rgba(9,9,9,0.82)] border border-[rgba(255,255,255,0.14)] px-3 py-1.5 rounded-[2px]" style={{ fontFamily: 'DM Mono, Courier New, monospace' }}>
            {value ? 'Pin set — drag to fine-tune' : 'Tap map to drop a pin'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapWrap}
        aria-label="Map of Rwanda — tap to place your precise location pin"
        className="loc-map h-80 w-full rounded-[2px] overflow-hidden border border-[rgba(255,255,255,0.1)]"
        style={{ background: '#0e0e0e' }}
      />
      {statusPill}
      {!value && (
        <span className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 z-[1000] text-[0.6rem] tracking-[0.16em] uppercase text-[#aaa] bg-[rgba(9,9,9,0.75)] border border-[rgba(255,255,255,0.12)] px-3 py-1.5 rounded-[2px]">
          Tap the map to drop a pin
        </span>
      )}
      {value && (
        <button
          type="button"
          onClick={() => {
            markerRef.current?.remove();
            markerRef.current = null;
            onChangeRef.current(null);
          }}
          className="absolute bottom-0 left-0 z-[1000] text-[0.6rem] tracking-[0.14em] uppercase text-[#aaa] bg-[rgba(9,9,9,0.85)] border border-[rgba(255,255,255,0.14)] px-3 py-1.5 rounded-[2px] hover:text-white hover:border-[rgba(255,255,255,0.3)] transition-colors duration-200"
        >
          Clear pin
        </button>
      )}
    </div>
  );
}