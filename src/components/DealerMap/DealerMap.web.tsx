import L from 'leaflet';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { useAppStore } from '../../store/useAppStore';
import { DEFAULT_ZOOM, DealerMapProps, MapMarker, isLightPin } from './types';

/**
 * Web map: real Leaflet + OpenStreetMap tiles (user-feedback pass 2).
 * react-native-web renders <View> as a div, so the View ref IS the DOM node
 * Leaflet mounts into. Pins are divIcons styled like the old stylized-map
 * price pills (incl. BEST PRICE / RECOMMENDED captions + selected enlarge).
 */

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

/** Inject the Leaflet stylesheet + divIcon reset exactly once. */
function injectLeafletCss(onReady: () => void) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector<HTMLLinkElement>(`link[href="${LEAFLET_CSS}"]`);
  if (!link) {
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS;
    document.head.appendChild(link);

    // Neutralize Leaflet's default divIcon chrome (white box + border).
    const style = document.createElement('style');
    style.textContent = '.am-divicon{background:transparent;border:none;}';
    document.head.appendChild(style);
  }
  // Tiles mis-position until the CSS applies — re-measure once it loads.
  if ((link as any)._amLoaded || link.sheet) onReady();
  else
    link.addEventListener('load', () => {
      (link as any)._amLoaded = true;
      onReady();
    });
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
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  // The "you are here" dot only shows once the user grants location access.
  const showUser = useAppStore((s) => s.locationPermission === 'granted');

  // Init once the container div exists.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      // Wheel zoom hijacks page scrolling — the +/- control still zooms.
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView([center.lat, center.lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    pinLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    injectLeafletCss(() => map.invalidateSize());

    return () => {
      map.remove();
      mapRef.current = null;
      pinLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
