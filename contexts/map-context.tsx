"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import type mapboxgl from "mapbox-gl";
import type { EnrichedGridProperties } from "@/types/geojson";
import type {
  PolygonFeature,
  PolygonFilters,
  PolygonStyleConfig,
} from "@/types/polygons";
import { FilterRange } from "@/lib/map-constants";

interface MapContextProps {
  mapInstance: mapboxgl.Map | null;
  setMapInstance: (map: mapboxgl.Map) => void;
  activeMetric: keyof EnrichedGridProperties;
  setActiveMetric: (metric: keyof EnrichedGridProperties) => void;
  visibleLayers: string[];
  setVisibleLayers: (layers: string[]) => void;
  colorScheme: string[];
  setColorScheme: (colors: string[]) => void;
  filterRange: FilterRange;
  setFilterRange: (range: FilterRange) => void;
  metricMaxValues: Record<string, number>;
  setMetricMaxValues: (values: Record<string, number>) => void;
  resetFilters: () => void;

  // Polygons state
  polygons: PolygonFeature[];
  setPolygons: (polygons: PolygonFeature[]) => void;
  polygonFilters: PolygonFilters;
  setPolygonFilters: (filters: PolygonFilters) => void;
  polygonStyleConfig: PolygonStyleConfig;
  setPolygonStyleConfig: (config: PolygonStyleConfig) => void;
  showPolygons: boolean;
  setShowPolygons: (show: boolean) => void;
  selectedPolygon: PolygonFeature | null;
  setSelectedPolygon: (polygon: PolygonFeature | null) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

// Default values
const DEFAULT_FILTER_RANGE: FilterRange = { min: 0, max: 10000 };
const DEFAULT_COLOR_SCHEME = [
  "#3498db",
  "#2ecc71",
  "#f1c40f",
  "#e67e22",
  "#e74c3c",
];

const DEFAULT_POLYGON_STYLE: PolygonStyleConfig = {
  surplusColor: "#e0e7ff", // Очень светло-синий для фона районов
  deficitColor: "#e0e7ff", // Очень светло-синий для фона районов
  opacity: 0.3, // Умеренная прозрачность для видимости границ
  strokeColor: "#3b82f6", // Яркие синие границы районов
  strokeWidth: 2, // Четкие границы для разделения районов
  highlightColor: "#3b82f6",
};

const DEFAULT_POLYGON_FILTERS: PolygonFilters = {
  status: "all",
  year: undefined, // Убираем дефолтный год
};

export function MapProvider({ children }: { children: ReactNode }) {
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [activeMetric, setActiveMetric] =
    useState<keyof EnrichedGridProperties>("population");
  const [visibleLayers, setVisibleLayers] = useState<string[]>(["areas"]);
  const [colorScheme, setColorScheme] =
    useState<string[]>(DEFAULT_COLOR_SCHEME);
  const [filterRange, setFilterRange] =
    useState<FilterRange>(DEFAULT_FILTER_RANGE);
  const [metricMaxValues, setMetricMaxValues] = useState<
    Record<string, number>
  >({});

  // Polygons state
  const [polygons, setPolygons] = useState<PolygonFeature[]>([]);
  const [polygonFilters, setPolygonFilters] = useState<PolygonFilters>(
    DEFAULT_POLYGON_FILTERS
  );
  const [polygonStyleConfig, setPolygonStyleConfig] =
    useState<PolygonStyleConfig>(DEFAULT_POLYGON_STYLE);
  const [showPolygons, setShowPolygons] = useState<boolean>(true);
  const [selectedPolygon, setSelectedPolygon] = useState<PolygonFeature | null>(
    null
  );

  // Reset filters to default values
  const resetFilters = useCallback(() => {
    // Use the calculated max value if available, otherwise use default
    const maxValue = metricMaxValues[activeMetric] || DEFAULT_FILTER_RANGE.max;
    setFilterRange({ min: 0, max: maxValue });
  }, [activeMetric, metricMaxValues]);

  // Update filter range when active metric changes
  useEffect(() => {
    const maxValue = metricMaxValues[activeMetric] || DEFAULT_FILTER_RANGE.max;
    setFilterRange({ min: 0, max: maxValue });
  }, [activeMetric, metricMaxValues]);

  return (
    <MapContext.Provider
      value={{
        mapInstance,
        setMapInstance,
        activeMetric,
        setActiveMetric,
        visibleLayers,
        setVisibleLayers,
        colorScheme,
        setColorScheme,
        filterRange,
        setFilterRange,
        metricMaxValues,
        setMetricMaxValues,
        resetFilters,
        polygons,
        setPolygons,
        polygonFilters,
        setPolygonFilters,
        polygonStyleConfig,
        setPolygonStyleConfig,
        showPolygons,
        setShowPolygons,
        selectedPolygon,
        setSelectedPolygon,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error("useMapContext must be used within a MapProvider");
  }
  return context;
};
