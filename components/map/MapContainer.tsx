"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { useAuth } from "@/contexts/auth-context";
import { useMapContext } from "@/contexts/map-context";
import useGeoJSONData from "@/hooks/useGeoJSONData";
import { createPopupHtml } from "./MapPopup";
import type { EnrichedGridProperties, EnrichedGridFeatureCollection } from "@/types/geojson";
import type { DistrictPolygon, SchoolFeature } from "@/types/schools-map";
import type { School } from "@/types/schools";

const ALMATY_CENTER: [number, number] = [43.238949, 76.889709];
const DEFAULT_ZOOM = 11;
const YANDEX_TILE_URL =
  "https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}&lang=ru_RU&projection=web_mercator";

interface MapContainerProps {
  districtPolygons?: DistrictPolygon[];
  schools?: SchoolFeature[];
  selectedSchool?: SchoolFeature | null;
  onSchoolSelect?: (school: SchoolFeature | null) => void;
  schoolsWithRatings?: School[];
}

// ── colour helpers ────────────────────────────────────────────────────────────

function getColorStops(maxValue: number, colorScheme: string[]): Array<[number, string]> {
  if (maxValue <= 100) {
    return [
      [0, colorScheme[0]],
      [maxValue * 0.1, colorScheme[1]],
      [maxValue * 0.25, colorScheme[2]],
      [maxValue * 0.5, colorScheme[3]],
      [maxValue, colorScheme[4]],
    ];
  } else if (maxValue <= 1000) {
    return [
      [0, colorScheme[0]],
      [maxValue * 0.15, colorScheme[1]],
      [maxValue * 0.4, colorScheme[2]],
      [maxValue * 0.7, colorScheme[3]],
      [maxValue, colorScheme[4]],
    ];
  } else {
    return [
      [0, colorScheme[0]],
      [maxValue * 0.05, colorScheme[1]],
      [maxValue * 0.2, colorScheme[2]],
      [maxValue * 0.5, colorScheme[3]],
      [maxValue, colorScheme[4]],
    ];
  }
}

function interpolateColor(value: number, stops: Array<[number, string]>): string {
  for (let i = 1; i < stops.length; i++) {
    if (value <= stops[i][0]) return stops[i][1];
  }
  return stops[stops.length - 1][1];
}

function getSchoolColor(school: SchoolFeature, schoolsWithRatings: School[]): string {
  const match = schoolsWithRatings.find(
    (s) =>
      s.id === school.id.toString() ||
      s.nameRu === school.properties.name_of_the_organization
  );
  if (match?.currentRating) {
    const r = match.currentRating;
    if (r >= 86) return "#10B981";
    if (r >= 50) return "#F59E0B";
    if (r >= 5) return "#EF4444";
  }
  const gis = school.properties.gis_rating;
  if (gis) {
    if (gis >= 4.0) return "#10B981";
    if (gis >= 3.0) return "#F59E0B";
    return "#EF4444";
  }
  if (school.properties.form_of_ownership?.includes("граждан")) return "#F97316";
  return "#6366F1";
}

function getSchoolRadius(school: SchoolFeature): number {
  const c = school.properties.contingency_filter;
  if (c) {
    if (c >= 1000) return 12;
    if (c >= 500) return 10;
    if (c >= 200) return 8;
    return 6;
  }
  return 8;
}

// ── component ─────────────────────────────────────────────────────────────────

export default function MapContainer({
  districtPolygons = [],
  schools = [],
  selectedSchool,
  onSchoolSelect,
  schoolsWithRatings = [],
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geoJSONLayerRef = useRef<L.GeoJSON | null>(null);
  const polygonLayerRef = useRef<L.LayerGroup | null>(null);
  const schoolLayerRef = useRef<L.LayerGroup | null>(null);
  const isUnmountingRef = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSchoolSelectRef = useRef<((school: any) => void) | undefined>(onSchoolSelect);

  const { accessToken } = useAuth();
  const { fetchGeoJSONData } = useGeoJSONData();
  const {
    activeMetric,
    colorScheme,
    visibleLayers,
    filterRange,
    setMapInstance,
    setMetricMaxValues,
    metricMaxValues,
    polygonStyleConfig,
    showPolygons,
    setSelectedPolygon,
  } = useMapContext();

  const [geoData, setGeoData] = useState<EnrichedGridFeatureCollection | null>(null);

  useEffect(() => {
    onSchoolSelectRef.current = onSchoolSelect;
  }, [onSchoolSelect]);

  // ── Map init (once) ──────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;

    isUnmountingRef.current = false;

    const map = L.map(mapRef.current, {
      crs: L.CRS.EPSG3857,
      center: ALMATY_CENTER,
      zoom: DEFAULT_ZOOM,
      preferCanvas: true,
      zoomAnimation: true,
      minZoom: 10,
      maxZoom: 18,
    });

    L.tileLayer(YANDEX_TILE_URL, {
      attribution: '&copy; <a href="https://yandex.com/maps/">Yandex</a>',
      maxZoom: 18,
      minZoom: 0,
      updateWhenIdle: false,
      keepBuffer: 2,
    }).addTo(map);

    mapInstanceRef.current = map;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setMapInstance(map as any);

    return () => {
      isUnmountingRef.current = true;
      const m = mapInstanceRef.current;
      if (m) {
        [geoJSONLayerRef, polygonLayerRef, schoolLayerRef].forEach((ref) => {
          if (ref.current) {
            try { m.removeLayer(ref.current); } catch { /* ignore */ }
            ref.current = null;
          }
        });
        m.off();
        m.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── GeoJSON fetch ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchGeoJSONData();
        if (cancelled) return;
        setGeoData(data);

        const maxValues: Record<string, number> = {};
        data.features.forEach((feature) => {
          Object.entries(feature.properties).forEach(([key, value]) => {
            if (typeof value === "number") {
              if (!maxValues[key]) maxValues[key] = 0;
              if (value > maxValues[key]) maxValues[key] = value;
            }
          });
        });
        Object.keys(maxValues).forEach((key) => {
          const v = maxValues[key];
          const mag = Math.pow(10, Math.floor(Math.log10(v || 1)));
          maxValues[key] = Math.ceil(v / mag) * mag;
        });
        setMetricMaxValues(maxValues);
      } catch (err) {
        console.error("Failed to load GeoJSON data:", err);
      }
    };

    load();
    const interval = setInterval(load, 2 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [accessToken, fetchGeoJSONData, setMetricMaxValues]);

  // ── GeoJSON layer ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoData || isUnmountingRef.current) return;

    if (geoJSONLayerRef.current) {
      try { map.removeLayer(geoJSONLayerRef.current); } catch { /* ignore */ }
      geoJSONLayerRef.current = null;
    }

    const maxValue = metricMaxValues[activeMetric] || 10000;
    const stops = getColorStops(maxValue, colorScheme);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const styleFeature = (feature: any): L.PathOptions => {
      const props = feature?.properties as EnrichedGridProperties | undefined;
      const value = (props?.[activeMetric] as number) || 0;
      const visible =
        visibleLayers.includes("areas") &&
        value >= filterRange.min &&
        value <= filterRange.max;
      return {
        fillColor: interpolateColor(value, stops),
        fillOpacity: visible ? 1 : 0,
        color: "#000",
        weight: 1,
        opacity: visible ? 1 : 0,
      };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const layer = L.geoJSON(geoData as any, {
      style: styleFeature,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onEachFeature: (feature: any, featureLayer: L.Layer) => {
        featureLayer.on("click", (e: L.LeafletMouseEvent) => {
          if (!feature.properties) return;
          L.popup({ maxWidth: 320 })
            .setLatLng(e.latlng)
            .setContent(
              createPopupHtml({
                properties: feature.properties as EnrichedGridProperties,
                activeMetric,
              })
            )
            .openOn(map);
        });
        featureLayer.on("mouseover", () => {
          (featureLayer as L.Path).setStyle({ fillOpacity: 0.7 });
        });
        featureLayer.on("mouseout", () => {
          (featureLayer as L.Path).setStyle(styleFeature(feature));
        });
      },
    });

    if (!isUnmountingRef.current) {
      try { layer.addTo(map); geoJSONLayerRef.current = layer; } catch { /* ignore */ }
    }
  }, [geoData, activeMetric, colorScheme, visibleLayers, filterRange, metricMaxValues]);

  // ── District polygons layer ───────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || isUnmountingRef.current) return;

    if (polygonLayerRef.current) {
      try { map.removeLayer(polygonLayerRef.current); } catch { /* ignore */ }
      polygonLayerRef.current = null;
    }

    if (!showPolygons || districtPolygons.length === 0) return;

    const group = L.layerGroup();

    districtPolygons.forEach((p) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = p as any;
      const geometry = raw.geometry;
      const props = raw.properties || {};
      if (!geometry) return;

      const isSurplus =
        (props.capacity_with_shifts_weighted || 0) > (props.demand_public_6_17 || 0);

      const polyStyle: L.PathOptions = {
        fillColor: isSurplus
          ? polygonStyleConfig.surplusColor
          : polygonStyleConfig.deficitColor,
        fillOpacity: polygonStyleConfig.opacity,
        color: polygonStyleConfig.strokeColor,
        weight: polygonStyleConfig.strokeWidth,
      };

      const toLatLngs = (ring: number[][]): L.LatLngExpression[] =>
        ring.map(([lng, lat]) => [lat, lng]);

      let poly: L.Layer | null = null;

      if (geometry.type === "Polygon") {
        poly = L.polygon(geometry.coordinates.map(toLatLngs), polyStyle);
      } else if (geometry.type === "MultiPolygon") {
        poly = L.polygon(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          geometry.coordinates.flatMap((p: any) => p.map(toLatLngs)),
          polyStyle
        );
      }

      if (!poly) return;

      poly.on("click", () => {
        if (props.polygon_id) setSelectedPolygon(props.polygon_id);
      });
      (poly as L.Path).on("mouseover", () => {
        (poly as L.Path).setStyle({
          fillOpacity: Math.min(polygonStyleConfig.opacity * 3, 0.6),
        });
      });
      (poly as L.Path).on("mouseout", () => {
        (poly as L.Path).setStyle(polyStyle);
      });

      group.addLayer(poly);
    });

    if (!isUnmountingRef.current) {
      try { group.addTo(map); polygonLayerRef.current = group; } catch { /* ignore */ }
    }
  }, [districtPolygons, polygonStyleConfig, showPolygons, setSelectedPolygon]);

  // ── School markers layer ─────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || isUnmountingRef.current) return;

    if (schoolLayerRef.current) {
      try { map.removeLayer(schoolLayerRef.current); } catch { /* ignore */ }
      schoolLayerRef.current = null;
    }

    if (schools.length === 0) return;

    const group = L.layerGroup();

    schools
      .filter((school) => {
        const coords = school.properties?.infra?.origin_marker?.coordinates;
        return Array.isArray(coords) && coords.length === 2;
      })
      .forEach((school) => {
        const [lng, lat] = school.properties.infra!.origin_marker
          .coordinates as [number, number];

        const circle = L.circleMarker([lat, lng], {
          radius: getSchoolRadius(school),
          fillColor: getSchoolColor(school, schoolsWithRatings),
          color: "#ffffff",
          weight: 2,
          fillOpacity: 0.8,
        });

        circle.bindPopup(
          `<div style="padding:4px 8px;font-size:14px;font-weight:500">${school.properties.name_of_the_organization}</div>`
        );

        circle.on("click", () => {
          onSchoolSelectRef.current?.(school);
        });

        group.addLayer(circle);
      });

    if (!isUnmountingRef.current) {
      try { group.addTo(map); schoolLayerRef.current = group; } catch { /* ignore */ }
    }
  }, [schools, schoolsWithRatings]);

  return <div ref={mapRef} className="h-full w-full" />;
}
