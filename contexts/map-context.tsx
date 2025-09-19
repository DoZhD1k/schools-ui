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
