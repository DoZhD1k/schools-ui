"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { GeoJSON, useMap } from "react-leaflet";
import { useMapContext } from "@/contexts/map-context";
import type { DistrictPolygon } from "@/types/schools-map";
import type { GeoJsonObject, Feature } from "geojson";

// ── data helpers (same logic as before, just moved here) ──────────────────────

interface PolygonFeatureProperties {
  polygon_id: number;
  year?: number;
  name?: string;
  capacity_with_shifts_weighted: number;
  demand_public_6_17: number;
  [key: string]: unknown;
}

interface RawPolygonFeature {
  properties?: PolygonFeatureProperties;
  geometry?: { type: string; coordinates: unknown };
}

const getAllPolygons = async () => {
  const response = await fetch(
    "/api/v1/institutions-monitoring/balance-enriched/?limit=10000",
    { headers: { Accept: "application/json", "Content-Type": "application/json" } }
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  return (data.features || []) as RawPolygonFeature[];
};

const formatPolygonData = (f: RawPolygonFeature) => {
  const p = f.properties || ({} as PolygonFeatureProperties);
  return {
    id: p.polygon_id,
    year: p.year,
    name: p.name || "Неизвестный район",
    status:
      p.capacity_with_shifts_weighted > p.demand_public_6_17 ? "surplus" : "deficit",
    capacity: p.capacity_with_shifts_weighted || 0,
    demand: p.demand_public_6_17 || 0,
    difference: (p.capacity_with_shifts_weighted || 0) - (p.demand_public_6_17 || 0),
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toGeoJSONFeatureCollection = (polygons: any[]) => ({
  type: "FeatureCollection" as const,
  features: polygons.map((p) => ({
    type: "Feature" as const,
    properties: { ...p.properties, ...formatPolygonData(p) },
    geometry: p.geometry,
  })),
});

// ── component ─────────────────────────────────────────────────────────────────

interface PolygonsLayerProps {
  districtPolygons?: DistrictPolygon[];
}

export default function PolygonsLayer({ districtPolygons }: PolygonsLayerProps) {
  const map = useMap();
  const {
    polygons,
    setPolygons,
    polygonFilters,
    polygonStyleConfig,
    showPolygons,
    setSelectedPolygon,
  } = useMapContext();

  const [error, setError] = useState<string | null>(null);

  // Use provided district polygons or fall back to context polygons
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activePolygons: any[] = districtPolygons || polygons;

  // Load polygons from API when none are provided via props
  useEffect(() => {
    if (districtPolygons && districtPolygons.length > 0) return;

    let cancelled = false;
    getAllPolygons()
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!cancelled) setPolygons(data as any);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      });

    return () => { cancelled = true; };
  }, [polygonFilters, setPolygons, districtPolygons]);

  // Fit map to polygon bounds when first loaded
  useEffect(() => {
    if (!activePolygons.length) return;

    const geojson = toGeoJSONFeatureCollection(activePolygons);
    const layer = L.geoJSON(geojson as GeoJsonObject);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
    // Only run once when polygons first arrive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePolygons.length > 0]);

  if (!showPolygons || activePolygons.length === 0) return null;

  const geojsonData = toGeoJSONFeatureCollection(activePolygons);

  const style = (feature?: Feature): L.PathOptions => {
    const isSurplus = feature?.properties?.status === "surplus";
    return {
      fillColor: isSurplus
        ? polygonStyleConfig.surplusColor
        : polygonStyleConfig.deficitColor,
      fillOpacity: polygonStyleConfig.opacity,
      color: polygonStyleConfig.strokeColor,
      weight: polygonStyleConfig.strokeWidth,
    };
  };

  const onEachFeature = (feature: Feature, layer: L.Layer) => {
    layer.on("click", () => {
      if (feature.properties?.polygon_id) {
        setSelectedPolygon(feature.properties.polygon_id);
      }
    });

    layer.on("mouseover", () => {
      (layer as L.Path).setStyle({
        fillOpacity: Math.min(polygonStyleConfig.opacity * 3, 0.6),
      });
    });
    layer.on("mouseout", () => {
      (layer as L.Path).setStyle(style(feature));
    });
  };

  if (error) return null;

  return (
    <GeoJSON
      key={`polygons-${activePolygons.length}`}
      data={geojsonData as GeoJsonObject}
      style={style as L.StyleFunction}
      onEachFeature={onEachFeature}
    />
  );
}
