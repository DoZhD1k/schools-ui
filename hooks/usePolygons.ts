"use client";

import { useState, useEffect, useCallback } from "react";
import { useMapContext } from "@/contexts/map-context";
import { PolygonsService } from "@/services/polygons.service";
import type { PolygonFeature, PolygonFilters } from "@/types/polygons";

interface UsePolygonsReturn {
  polygons: PolygonFeature[];
  isLoading: boolean;
  error: string | null;
  loadPolygons: () => Promise<void>;
  refreshPolygons: () => Promise<void>;
  statistics: ReturnType<typeof PolygonsService.getPolygonsStatistics> | null;
}

export function usePolygons(): UsePolygonsReturn {
  const { polygonFilters } = useMapContext();
  const [polygons, setPolygons] = useState<PolygonFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<ReturnType<
    typeof PolygonsService.getPolygonsStatistics
  > | null>(null);

  const loadPolygons = useCallback(
    async (filters?: PolygonFilters) => {
      setIsLoading(true);
      setError(null);

      try {
        console.log(
          "Loading polygons with filters:",
          filters || polygonFilters
        );
        const data = await PolygonsService.getAllPolygons(
          filters || polygonFilters || undefined
        );

        setPolygons(data);

        // Calculate statistics
        const stats = PolygonsService.getPolygonsStatistics(data);
        setStatistics(stats);

        console.log(`Loaded ${data.length} polygons successfully`);
        console.log("Statistics:", stats);
      } catch (err) {
        console.error("Error loading polygons:", err);
        setError(
          err instanceof Error ? err.message : "Не удалось загрузить полигоны"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [polygonFilters]
  );

  const refreshPolygons = useCallback(async () => {
    await loadPolygons();
  }, [loadPolygons]);

  // Load polygons when filters change
  useEffect(() => {
    loadPolygons();
  }, [loadPolygons]);

  return {
    polygons,
    isLoading,
    error,
    loadPolygons,
    refreshPolygons,
    statistics,
  };
}
