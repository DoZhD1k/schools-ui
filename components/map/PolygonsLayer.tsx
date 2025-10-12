"use client";

import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { FilterSpecification } from "mapbox-gl";
import { useMapContext } from "@/contexts/map-context";
import type { PolygonFeature } from "@/types/polygons";
import type { DistrictPolygon } from "@/types/schools-map";

// Вспомогательные функции для работы с полигонами
const getAllPolygons = async (filters: any) => {
  try {
    const response = await fetch(
      "/api/v1/institutions-monitoring/balance-enriched/?limit=10000",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Polygons API response:", data);
    console.log("🔢 Loaded polygons count:", data.features?.length || 0);

    return data.features || [];
  } catch (error) {
    console.error("Error loading polygons:", error);
    throw error;
  }
};

const formatPolygonData = (polygonFeature: any) => {
  const props = polygonFeature.properties || {};
  return {
    id: props.polygon_id,
    year: props.year,
    name: props.name || "Неизвестный район",
    status:
      props.capacity_with_shifts_weighted > props.demand_public_6_17
        ? "surplus"
        : "deficit",
    capacity: props.capacity_with_shifts_weighted || 0,
    demand: props.demand_public_6_17 || 0,
    difference:
      (props.capacity_with_shifts_weighted || 0) -
      (props.demand_public_6_17 || 0),
  };
};

const createFilterSpecification = (filters: any): FilterSpecification => {
  const conditions: any[] = ["all"];

  if (filters && filters.year) {
    conditions.push(["==", ["get", "year"], filters.year]);
  }

  return conditions.length > 1 ? conditions : ["has", "polygon_id"];
};

const createGeoJSONFeature = (polygon: any) => {
  const formattedData = formatPolygonData(polygon);

  return {
    type: "Feature" as const,
    properties: {
      ...polygon.properties,
      ...formattedData,
    },
    geometry: polygon.geometry,
  };
};

const createGeoJSONData = (polygons: any[]) => {
  return {
    type: "FeatureCollection" as const,
    features: polygons.map(createGeoJSONFeature),
  };
};

interface PolygonsLayerProps {
  mapInstance: mapboxgl.Map;
  districtPolygons?: DistrictPolygon[];
}

export default function PolygonsLayer({
  mapInstance,
  districtPolygons,
}: PolygonsLayerProps) {
  const {
    polygons,
    setPolygons,
    polygonFilters,
    polygonStyleConfig,
    showPolygons,
    selectedPolygon,
    setSelectedPolygon,
  } = useMapContext();

  // Default style configuration if not provided by context
  const defaultPolygonStyle = {
    surplusColor: "#a5b8bd", // Gray for surplus
    deficitColor: "#a5b8bd", // Red for deficit
    opacity: 0.1,
    strokeColor: "#555656", // Dark gray for borders
    strokeWidth: 0.5,
  };

  const activePolygonStyle = polygonStyleConfig || defaultPolygonStyle;

  // Используем переданные districtPolygons или polygons из контекста
  const activePolygons = districtPolygons || polygons;

  console.log("🎯 PolygonsLayer render:", {
    mapInstanceReady: !!mapInstance,
    polygonsCount: activePolygons.length,
    showPolygons,
    polygonFilters,
    usingFilteredPolygons: !!districtPolygons,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load polygons data when component mounts or filters change
  useEffect(() => {
    // Если переданы districtPolygons, не загружаем из API
    if (districtPolygons && districtPolygons.length > 0) {
      console.log(
        "🎯 Using provided district polygons:",
        districtPolygons.length
      );
      return;
    }

    const loadPolygons = async () => {
      console.log("🔄 Loading polygons with filters:", polygonFilters);
      setIsLoading(true);
      setError(null);

      try {
        const polygonData = await getAllPolygons(polygonFilters);
        setPolygons(polygonData);
        console.log("✅ Polygons loaded successfully:", polygonData.length);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("❌ Failed to load polygons:", errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadPolygons();
  }, [polygonFilters, setPolygons, districtPolygons]);

  // Add/update polygons on the map when data changes
  useEffect(() => {
    if (!mapInstance || !showPolygons || activePolygons.length === 0) {
      console.log("⏸️ Skipping polygon update:", {
        mapInstance: !!mapInstance,
        showPolygons,
        polygonsCount: activePolygons.length,
      });
      return;
    }

    if (!mapInstance.loaded() || !mapInstance.isStyleLoaded()) {
      console.log("⏸️ Map not ready yet, waiting...");
      console.log("🔍 Map state:", {
        loaded: mapInstance.loaded(),
        styleLoaded: mapInstance.isStyleLoaded(),
      });

      // Multiple event handlers for different map ready states
      const onLoad = () => {
        console.log("🎉 Map load event triggered");
        if (mapInstance.loaded() && mapInstance.isStyleLoaded()) {
          updatePolygonsOnMap();
        }
      };

      const onStyleLoad = () => {
        console.log("🎉 Map style load event triggered");
        if (mapInstance.loaded() && mapInstance.isStyleLoaded()) {
          updatePolygonsOnMap();
        }
      };

      mapInstance.once("load", onLoad);
      mapInstance.once("styledata", onStyleLoad);

      // Also set a delayed retry as fallback
      const retryTimeout = setTimeout(() => {
        console.log("⏰ Retry timeout triggered");
        if (mapInstance.loaded() && mapInstance.isStyleLoaded()) {
          updatePolygonsOnMap();
        }
      }, 1000); // Increased from 100ms to 1000ms

      return () => {
        mapInstance.off("load", onLoad);
        mapInstance.off("styledata", onStyleLoad);
        clearTimeout(retryTimeout);
      };
    }

    updatePolygonsOnMap();
  }, [mapInstance, activePolygons, showPolygons, activePolygonStyle]);

  const updatePolygonsOnMap = () => {
    const POLYGONS_SOURCE_ID = "polygons-source";
    const POLYGONS_FILL_LAYER_ID = "polygons-fill";
    const POLYGONS_STROKE_LAYER_ID = "polygons-stroke";

    console.log("🗺️ Updating polygons on map:", {
      polygonsCount: activePolygons.length,
      mapLoaded: mapInstance.loaded(),
      polygonStyleConfig: activePolygonStyle,
    });

    // Create filter specification
    const filterSpec = createFilterSpecification(polygonFilters || null);
    console.log("🔍 Created filter specification:", filterSpec);

    // Create GeoJSON data
    const geojsonData = createGeoJSONData(activePolygons);

    console.log("🌐 GeoJSON data created:", {
      type: geojsonData.type,
      featuresCount: geojsonData.features.length,
      firstFeature: geojsonData.features[0],
      firstFeatureGeometry: geojsonData.features[0]?.geometry,
      firstFeatureCoords: geojsonData.features[0]?.geometry?.coordinates,
    });

    // Add source if it doesn't exist
    if (!mapInstance.getSource(POLYGONS_SOURCE_ID)) {
      console.log("🔗 Adding new source:", POLYGONS_SOURCE_ID);
      mapInstance.addSource(POLYGONS_SOURCE_ID, {
        type: "geojson",
        data: geojsonData,
      });

      // Fit map to polygon bounds on first load
      const bounds = new mapboxgl.LngLatBounds();
      geojsonData.features.forEach((feature) => {
        if (
          feature.geometry.type === "Polygon" &&
          feature.geometry.coordinates
        ) {
          feature.geometry.coordinates.forEach((ring: any) => {
            ring.forEach((coord: any) => {
              bounds.extend(coord as [number, number]);
            });
          });
        }
      });

      if (!bounds.isEmpty()) {
        console.log("📍 Fitting map to polygon bounds");
        mapInstance.fitBounds(bounds, {
          padding: 50,
          maxZoom: 13,
          duration: 1000,
        });
      }
    } else {
      console.log("🔄 Updating existing source:", POLYGONS_SOURCE_ID);
      // Update existing source data
      const source = mapInstance.getSource(
        POLYGONS_SOURCE_ID
      ) as mapboxgl.GeoJSONSource;
      source.setData(geojsonData);

      // Принудительно обновляем стили при обновлении данных
      setTimeout(() => {
        if (mapInstance.getLayer(POLYGONS_FILL_LAYER_ID)) {
          mapInstance.setPaintProperty(
            POLYGONS_FILL_LAYER_ID,
            "fill-opacity",
            activePolygonStyle.opacity
          );
          console.log(
            `🔧 Force-updated fill opacity after data update to ${activePolygonStyle.opacity}`
          );
        }
      }, 100);
    }

    // Add fill layer if it doesn't exist
    if (!mapInstance.getLayer(POLYGONS_FILL_LAYER_ID)) {
      console.log("🎨 Adding fill layer:", POLYGONS_FILL_LAYER_ID);

      // Добавляем полигоны ПЕРЕД школьными полигонами
      // Это поместит районные полигоны под школьными полигонами
      let beforeLayerId: string | undefined;

      // Ищем школьный слой, чтобы добавить районные полигоны перед ним
      const schoolsFillLayer = "schools-polygons-fill";
      if (mapInstance.getLayer(schoolsFillLayer)) {
        beforeLayerId = schoolsFillLayer;
        console.log(
          "📍 Adding district polygons BEFORE schools layer:",
          beforeLayerId
        );
      } else {
        // Если школьного слоя нет, все равно добавляем в фоне
        // Найдем любой существующий слой, чтобы районы были снизу
        const layers = mapInstance.getStyle().layers;
        const firstSymbolLayer = layers.find(
          (layer) => layer.type === "symbol"
        );
        beforeLayerId = firstSymbolLayer ? firstSymbolLayer.id : undefined;
        console.log(
          "📍 Adding district polygons BELOW symbol layers:",
          beforeLayerId || "at bottom"
        );
      }
      mapInstance.addLayer(
        {
          id: POLYGONS_FILL_LAYER_ID,
          type: "fill",
          source: POLYGONS_SOURCE_ID,
          layout: {
            visibility: "visible",
          },
          paint: {
            "fill-color": [
              "case",
              ["==", ["get", "status"], "surplus"],
              activePolygonStyle.surplusColor,
              activePolygonStyle.deficitColor,
            ],
            "fill-opacity": activePolygonStyle.opacity,
          },
        },
        beforeLayerId
      ); // Insert at the top (beforeLayerId = undefined)
      console.log(
        "✅ Fill layer added successfully at the TOP" +
          ` with opacity: ${activePolygonStyle.opacity}`
      );

      // Принудительно устанавливаем правильную прозрачность
      setTimeout(() => {
        if (mapInstance.getLayer(POLYGONS_FILL_LAYER_ID)) {
          // Используем настройки из конфигурации
          mapInstance.setPaintProperty(
            POLYGONS_FILL_LAYER_ID,
            "fill-opacity",
            activePolygonStyle.opacity
          );
          console.log(
            `🔧 Force-updated fill opacity to ${activePolygonStyle.opacity}`
          );
        }
      }, 100);
    } else {
      console.log("🔄 Updating existing fill layer paint properties");
      // Update layer paint properties
      mapInstance.setPaintProperty(
        POLYGONS_FILL_LAYER_ID,
        "fill-color",
        activePolygonStyle.surplusColor
      );
      mapInstance.setPaintProperty(
        POLYGONS_FILL_LAYER_ID,
        "fill-opacity",
        activePolygonStyle.opacity
      );
    }

    // Add stroke layer if it doesn't exist
    if (!mapInstance.getLayer(POLYGONS_STROKE_LAYER_ID)) {
      console.log("🖼️ Adding stroke layer:", POLYGONS_STROKE_LAYER_ID);

      // Тот же beforeLayerId что и для fill слоя
      let strokeBeforeLayerId: string | undefined;
      const schoolsFillLayer = "schools-polygons-fill";
      if (mapInstance.getLayer(schoolsFillLayer)) {
        strokeBeforeLayerId = schoolsFillLayer;
        console.log(
          "📍 Adding district stroke BEFORE schools layer:",
          strokeBeforeLayerId
        );
      } else {
        // Если школьного слоя нет, добавляем перед символьными слоями
        const layers = mapInstance.getStyle().layers;
        const firstSymbolLayer = layers.find(
          (layer) => layer.type === "symbol"
        );
        strokeBeforeLayerId = firstSymbolLayer
          ? firstSymbolLayer.id
          : undefined;
        console.log(
          "📍 Adding district stroke BELOW symbol layers:",
          strokeBeforeLayerId || "at bottom"
        );
      }

      mapInstance.addLayer(
        {
          id: POLYGONS_STROKE_LAYER_ID,
          type: "line",
          source: POLYGONS_SOURCE_ID,
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-color": activePolygonStyle.strokeColor,
            "line-width": activePolygonStyle.strokeWidth,
            "line-opacity": 1,
          },
        },
        strokeBeforeLayerId // Add before schools layers
      );
      console.log(
        "✅ Stroke layer added successfully at the TOP" +
          ` with width: ${activePolygonStyle.strokeWidth}`
      );
    } else {
      console.log("🔄 Updating existing stroke layer paint properties");
      // Update stroke layer paint properties
      mapInstance.setPaintProperty(
        POLYGONS_STROKE_LAYER_ID,
        "line-color",
        activePolygonStyle.strokeColor
      );
      mapInstance.setPaintProperty(
        POLYGONS_STROKE_LAYER_ID,
        "line-width",
        activePolygonStyle.strokeWidth
      );
    }

    // Apply filter to both layers
    mapInstance.setFilter(POLYGONS_FILL_LAYER_ID, filterSpec);
    mapInstance.setFilter(POLYGONS_STROKE_LAYER_ID, filterSpec);
    console.log("🔍 Applied filter to layers:", filterSpec);
  };

  // Handle polygon click events
  useEffect(() => {
    if (!mapInstance || !showPolygons) return;

    const POLYGONS_FILL_LAYER_ID = "polygons-fill";
    const POLYGONS_SOURCE_ID = "polygons-source";

    let hoveredPolygonId: string | number | null = null;

    const onClick = (e: mapboxgl.MapMouseEvent) => {
      const features = mapInstance.queryRenderedFeatures(e.point, {
        layers: [POLYGONS_FILL_LAYER_ID],
      });

      if (features.length > 0) {
        const feature = features[0];
        const polygonId = feature.properties?.polygon_id;

        console.log("🖱️ Polygon clicked:", {
          polygonId,
          properties: feature.properties,
          sourceExists: !!mapInstance.getSource(POLYGONS_SOURCE_ID),
          layerExists: !!mapInstance.getLayer(POLYGONS_FILL_LAYER_ID),
        });

        if (polygonId) {
          setSelectedPolygon(polygonId);
        }
      }
    };

    const onMouseEnter = () => {
      mapInstance.getCanvas().style.cursor = "pointer";
    };

    const onMouseLeave = () => {
      mapInstance.getCanvas().style.cursor = "";
      if (hoveredPolygonId !== null) {
        mapInstance.setFeatureState(
          { source: POLYGONS_SOURCE_ID, id: hoveredPolygonId },
          { hover: false }
        );
      }
      hoveredPolygonId = null;
    };

    const onMouseMove = (e: mapboxgl.MapMouseEvent) => {
      const features = mapInstance.queryRenderedFeatures(e.point, {
        layers: [POLYGONS_FILL_LAYER_ID],
      });

      if (features.length > 0) {
        if (hoveredPolygonId !== null) {
          mapInstance.setFeatureState(
            { source: POLYGONS_SOURCE_ID, id: hoveredPolygonId },
            { hover: false }
          );
        }
        hoveredPolygonId = features[0].id || null;
        if (hoveredPolygonId !== null) {
          mapInstance.setFeatureState(
            { source: POLYGONS_SOURCE_ID, id: hoveredPolygonId },
            { hover: true }
          );
        }
      }
    };

    // Add event listeners
    mapInstance.on("click", POLYGONS_FILL_LAYER_ID, onClick);
    mapInstance.on("mouseenter", POLYGONS_FILL_LAYER_ID, onMouseEnter);
    mapInstance.on("mouseleave", POLYGONS_FILL_LAYER_ID, onMouseLeave);
    mapInstance.on("mousemove", POLYGONS_FILL_LAYER_ID, onMouseMove);

    return () => {
      // Remove event listeners
      mapInstance.off("click", POLYGONS_FILL_LAYER_ID, onClick);
      mapInstance.off("mouseenter", POLYGONS_FILL_LAYER_ID, onMouseEnter);
      mapInstance.off("mouseleave", POLYGONS_FILL_LAYER_ID, onMouseLeave);
      mapInstance.off("mousemove", POLYGONS_FILL_LAYER_ID, onMouseMove);
    };
  }, [mapInstance, showPolygons, setSelectedPolygon]);

  // Handle selected polygon highlighting
  useEffect(() => {
    if (!mapInstance || !showPolygons) return;

    const POLYGONS_SOURCE_ID = "polygons-source";

    if (selectedPolygon) {
      console.log("🎯 Highlighting selected polygon:", selectedPolygon);
      mapInstance.setFeatureState(
        {
          source: POLYGONS_SOURCE_ID,
          id: selectedPolygon,
        },
        { selected: true }
      );
    }

    return () => {
      if (selectedPolygon) {
        mapInstance.setFeatureState(
          {
            source: POLYGONS_SOURCE_ID,
            id: selectedPolygon,
          },
          { selected: false }
        );
      }
    };
  }, [mapInstance, selectedPolygon, showPolygons]);

  // Cleanup function to remove layers and source when component unmounts
  useEffect(() => {
    return () => {
      if (!mapInstance || !mapInstance.getLayer) return;

      const POLYGONS_FILL_LAYER_ID = "polygons-fill";
      const POLYGONS_STROKE_LAYER_ID = "polygons-stroke";
      const POLYGONS_SOURCE_ID = "polygons-source";

      try {
        // Remove layers first
        if (mapInstance.getLayer(POLYGONS_STROKE_LAYER_ID)) {
          mapInstance.removeLayer(POLYGONS_STROKE_LAYER_ID);
        }
        if (mapInstance.getLayer(POLYGONS_FILL_LAYER_ID)) {
          mapInstance.removeLayer(POLYGONS_FILL_LAYER_ID);
        }

        // Then remove source
        if (mapInstance.getSource(POLYGONS_SOURCE_ID)) {
          mapInstance.removeSource(POLYGONS_SOURCE_ID);
        }

        console.log("🧹 Cleaned up polygons layers and source");
      } catch (error) {
        console.warn("⚠️ Error during polygons cleanup:", error);
      }
    };
  }, [mapInstance]);

  if (error) {
    return (
      <div className="polygon-layer-error">
        <p>Error loading polygons: {error}</p>
      </div>
    );
  }

  return null; // This component only handles map interactions
}
