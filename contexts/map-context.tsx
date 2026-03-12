"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import type { Map as LeafletMap } from "leaflet";
import type { EnrichedGridProperties } from "@/types/geojson";
import type { PolygonFeature } from "@/types/polygons";
import { FilterRange } from "@/lib/map-constants";

interface MapContextProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapInstance: LeafletMap | any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setMapInstance: (map: LeafletMap | any) => void;
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
  showPolygons: boolean;
  setShowPolygons: (show: boolean) => void;
  polygons: PolygonFeature[];
  setPolygons: (polygons: PolygonFeature[]) => void;
  // Добавляем недостающие свойства для полигонов
  selectedPolygon: number | null;
  setSelectedPolygon: (id: number | null) => void;
  polygonFilters: Record<string, string | number | boolean> | null;
  setPolygonFilters: (
    filters: Record<string, string | number | boolean> | null
  ) => void;
  polygonStyleConfig: {
    surplusColor: string;
    deficitColor: string;
    opacity: number;
    strokeColor: string;
    strokeWidth: number;
  };
  setPolygonStyleConfig: (config: {
    surplusColor: string;
    deficitColor: string;
    opacity: number;
    strokeColor: string;
    strokeWidth: number;
  }) => void;
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

export function MapProvider({ children }: { children: ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mapInstance, setMapInstance] = useState<LeafletMap | any | null>(null);
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
  const [showPolygons, setShowPolygons] = useState<boolean>(true);
  const [polygons, setPolygons] = useState<PolygonFeature[]>([]);

  // Новые состояния для полигонов
  const [selectedPolygon, setSelectedPolygon] = useState<number | null>(null);
  const [polygonFilters, setPolygonFilters] = useState<Record<
    string,
    string | number | boolean
  > | null>(null);
  const [polygonStyleConfig, setPolygonStyleConfig] = useState({
    surplusColor: "#a5b8bd", // Gray for surplus
    deficitColor: "#a5b8bd", // Red for deficit
    opacity: 0.1,
    strokeColor: "#555656", // Dark gray stroke
    strokeWidth: 1,
  });

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
        showPolygons,
        setShowPolygons,
        polygons,
        setPolygons,
        // Добавляем новые свойства
        selectedPolygon,
        setSelectedPolygon,
        polygonFilters,
        setPolygonFilters,
        polygonStyleConfig,
        setPolygonStyleConfig,
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
