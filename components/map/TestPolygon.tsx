"use client";

import { useEffect } from "react";
import mapboxgl from "mapbox-gl";

interface TestPolygonProps {
  mapInstance: mapboxgl.Map;
}

const TEST_POLYGON_SOURCE = "test-polygon-source";
const TEST_POLYGON_LAYER = "test-polygon-layer";

export default function TestPolygon({ mapInstance }: TestPolygonProps) {
  useEffect(() => {
    if (!mapInstance) return;

    console.log("🧪 Adding test polygon to map...");

    // Создаем простой тестовый полигон в центре Алматы
    const testPolygon: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: "Test Polygon" },
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [76.92, 43.25], // bottom-left
                [76.94, 43.25], // bottom-right
                [76.94, 43.27], // top-right
                [76.92, 43.27], // top-left
                [76.92, 43.25], // closing point (same as first)
              ],
            ],
          },
        },
      ],
    };

    console.log("🧪 Test polygon data:", testPolygon);

    // Добавляем источник
    if (!mapInstance.getSource(TEST_POLYGON_SOURCE)) {
      mapInstance.addSource(TEST_POLYGON_SOURCE, {
        type: "geojson",
        data: testPolygon,
      });
      console.log("✅ Test polygon source added");
    }

    // Добавляем слой заливки
    if (!mapInstance.getLayer(TEST_POLYGON_LAYER)) {
      mapInstance.addLayer({
        id: TEST_POLYGON_LAYER,
        type: "fill",
        source: TEST_POLYGON_SOURCE,
        paint: {
          "fill-color": "#FF0000",
          "fill-opacity": 0.5,
        },
      });
      console.log("✅ Test polygon layer added");
    }

    // Добавляем обводку
    const TEST_POLYGON_OUTLINE = "test-polygon-outline";
    if (!mapInstance.getLayer(TEST_POLYGON_OUTLINE)) {
      mapInstance.addLayer({
        id: TEST_POLYGON_OUTLINE,
        type: "line",
        source: TEST_POLYGON_SOURCE,
        paint: {
          "line-color": "#000000",
          "line-width": 2,
        },
      });
      console.log("✅ Test polygon outline added");
    }

    return () => {
      // Cleanup
      if (mapInstance.getLayer(TEST_POLYGON_OUTLINE)) {
        mapInstance.removeLayer(TEST_POLYGON_OUTLINE);
      }
      if (mapInstance.getLayer(TEST_POLYGON_LAYER)) {
        mapInstance.removeLayer(TEST_POLYGON_LAYER);
      }
      if (mapInstance.getSource(TEST_POLYGON_SOURCE)) {
        mapInstance.removeSource(TEST_POLYGON_SOURCE);
      }
    };
  }, [mapInstance]);

  return null;
}
