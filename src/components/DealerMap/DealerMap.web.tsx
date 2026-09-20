import L from 'leaflet';
// Leaflet's stylesheet ships with the bundle (Metro CSS), no CDN request.
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme';
import { DEFAULT_ZOOM, DealerMapProps, MapMarker, isLightPin } from './types';

/** Tile sets per appearance: OSM's standard tiles in light, CARTO's dark basemap (OSM data) in dark. */
const TILES = {
  light: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

/**
 * Web map: real Leaflet + OpenStreetMap tiles (user-feedback pass 2).
 * react-native-web renders <View> as a div, so the View ref IS the DOM node
 * Leaflet mounts into. Pins are divIcons styled like the old stylized-map
 * price pills (incl. BEST PRICE / RECOMMENDED captions + selected enlarge).
 */

/** Neutralize Leaflet's default divIcon chrome (white box + border), once per page. */
function injectPinCss() {
  if (typeof document === 'undefined' || document.getElementById('am-divicon-css')) return;
  const style = document.createElement('style');
  style.id = 'am-divicon-css';
  style.textContent = '.am-divicon{background:transparent;border:none;}';
  document.head.appendChild(style);
}

/** HTML for a price-pill pin (mirrors the pass-1 stylized pins). */
function pinHtml(m: MapMarker): string {
  const light = isLightPin(m.color);
  const fg = light ? '#1A1A1A' : '#fff';
  const border = m.selected
    ? '2px solid #1A1A1A'
    : light
      ? '1px solid #ccc'
      : '1.5px solid #fff';
  const scale = m.selected ? 1.2 : 1;
  const shadow = m.selected ? '0 3px 9px rgba(0,0,0,.4)' : '0 2px 5px rgba(0,0,0,.25)';
  const tag = m.tag
    ? `<div style="font-size:9px;font-weight:700;margin-top:2px;color:${
        m.tagColor ?? '#534AB7'
      };white-space:nowrap;text-shadow:0 0 3px #fff,0 0 3px #fff;">${m.tag}</div>`
    : '';
  return (
    `<div style="transform:translate(-50%,-50%) scale(${scale});transform-origin:center;` +
    `display:flex;flex-direction:column;align-items:center;cursor:pointer;">` +
    `<div style="background:${m.color};color:${fg};border:${border};border-radius:999px;` +
    `padding:5px 10px;font:800 12px -apple-system,system-ui,sans-serif;white-space:nowrap;` +
    `box-shadow:${shadow};">${m.label}</div>${tag}</div>`
  );
}

const USER_DOT_HTML =
  '<div style="transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;' +
  'background:#378ADD;border:3px solid #fff;box-shadow:0 0 6px rgba(55,138,221,.6);"></div>';

export function DealerMap({
  markers,
  center,
  zoom = DEFAULT_ZOOM,
  userLocation,
  onSelect,
  style,
}: DealerMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pinLayerRef = useRef<L.LayerGroup | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  // The "you are here" dot only shows once the user grants location access.
  const showUser = useAppStore((s) => s.locationPermission === 'granted');
  const { dark } = useTheme();

  // Init once the container div exists.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      // Wheel zoom hijacks page scrolling, the +/- control still zooms.
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView([center.lat, center.lng], zoom);
    pinLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    injectPinCss();
    map.invalidateSize();

    // Full-bleed maps get their size after mount, re-measure when the box changes.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => map.invalidateSize()) : null;
    ro?.observe(el);

    return () => {
      ro?.disconnect();
      map.remove();
      mapRef.current = null;
      pinLayerRef.current = null;
      tileRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tiles follow the appearance setting (dark basemap in dark mode).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    tileRef.current?.remove();
    const t = dark ? TILES.dark : TILES.light;
    const layer = L.tileLayer(t.url, { maxZoom: 19, attribution: t.attribution });
    // If the themed basemap can't be reached, fall back to the standard OSM
    // tiles so the map never renders as an empty grey panel.
    let fellBack = false;
    layer.on('tileerror', () => {
      if (fellBack || !mapRef.current) return;
      fellBack = true;
      layer.remove();
      tileRef.current = L.tileLayer(TILES.light.url, { maxZoom: 19, attribution: TILES.light.attribution }).addTo(mapRef.current);
      tileRef.current.bringToBack();
    });
    layer.addTo(map);
    tileRef.current = layer;
    layer.bringToBack();
  }, [dark]);

  // Pan when the focus changes (e.g. a card/pin gets selected).
  useEffect(() => {
    mapRef.current?.panTo([center.lat, center.lng], { animate: true });
  }, [center.lat, center.lng]);

  // (Re)draw pins whenever markers change (selection lives in the array).
  useEffect(() => {
    const layer = pinLayerRef.current;
    if (!layer) return;
    layer.clearLayers();

    if (userLocation && showUser) {
      L.marker([userLocation.lat, userLocation.lng], {
        icon: L.divIcon({ className: 'am-divicon', html: USER_DOT_HTML, iconSize: [0, 0] }),
        interactive: false,
        zIndexOffset: -100,
      }).addTo(layer);
    }

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], {
        icon: L.divIcon({ className: 'am-divicon', html: pinHtml(m), iconSize: [0, 0] }),
        zIndexOffset: m.selected ? 1000 : 0,
      });
      marker.on('click', () => onSelectRef.current?.(m.id));
      marker.addTo(layer);
    });
  }, [markers, userLocation, showUser]);

  // RN-web: the View ref is the underlying HTMLDivElement Leaflet needs.
  return <View ref={containerRef as any} style={style} />;
}
