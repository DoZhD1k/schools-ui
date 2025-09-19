// useGeoJSONData.ts
import { useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import type mapboxgl from "mapbox-gl";
import type {
  RawEnrichedGridItem,
  EnrichedGridFeatureCollection,
  EnrichedGridProperties,
} from "@/types/geojson";
import type { Feature, MultiPolygon } from "geojson";

const useGeoJSONData = () => {
  const { accessToken } = useAuth();
  // Cache the fetched data to prevent unnecessary rerenders
  const dataCache = useRef<EnrichedGridFeatureCollection | null>(null);
  // Track the last fetch time to implement cache expiration
  const lastFetchTime = useRef<number>(0);
  // Cache expiration time (15 minutes)
  const CACHE_DURATION = 15 * 60 * 1000;

  /**
   * Normalizes properties to ensure no null values exist
   */
  const normalizeProperties = useCallback(
    (properties: EnrichedGridProperties): EnrichedGridProperties => {
      // Create a copy of the properties object
      const normalized = { ...properties };

      // Replace null values with appropriate defaults (0 for numerical fields)
      // Using proper TypeScript type assertions to avoid index errors
      for (const key in normalized) {
        if (normalized[key as keyof EnrichedGridProperties] === null) {
          (normalized as Record<string, unknown>)[key] = 0;
        }
      }

      return normalized;
    },
    []
  );

  /**
   * Поддерживает оба формата:
   * — массив RawEnrichedGridItem
   * — уже готовый EnrichedGridFeatureCollection
   */
  const fetchGeoJSONData = useCallback<
    () => Promise<EnrichedGridFeatureCollection>
  >(async () => {
    // Check if cache is valid
    const now = Date.now();
    if (dataCache.current && now - lastFetchTime.current < CACHE_DURATION) {
      console.log("Using cached GeoJSON data");
      return dataCache.current;
    }

    try {
      console.log("Fetching fresh GeoJSON data...");
      const res = await fetch("/api/geo-data", {
        headers: { Authorization: `Bearer ${accessToken}` },
        // Add cache control headers
        cache: "no-cache",
      });

      if (!res.ok) throw new Error(`GeoJSON fetch failed: ${res.status}`);

      const raw = (await res.json()) as
        | RawEnrichedGridItem[]
        | EnrichedGridFeatureCollection;

      let processedData: EnrichedGridFeatureCollection;

      if (Array.isArray(raw)) {
        const features: Array<Feature<MultiPolygon, EnrichedGridProperties>> =
          raw.map((item) => {
            const { id, properties, geometry } = item;
            const { geometry: _unused, ...cleanProps } = properties;
            // Apply normalization to properties
            const normalizedProps = normalizeProperties(cleanProps);
            return {
              type: "Feature",
              id: id.toString(),
              properties: normalizedProps,
              geometry,
            };
          });

        processedData = {
          type: "FeatureCollection",
          features,
        };
      } else {
        const normalizedFeatures = raw.features.map((feature) => ({
          ...feature,
          properties: normalizeProperties(feature.properties),
        }));

        processedData = {
          type: "FeatureCollection",
          features: normalizedFeatures,
        };
      }

      // Update cache
      dataCache.current = processedData;
      lastFetchTime.current = now;

      return processedData;
    } catch (error) {
      console.error("Error fetching GeoJSON data:", error);
      // If fetch fails but we have cached data, return it as fallback
      if (dataCache.current) {
        console.warn("Using cached data as fallback after fetch error");
        return dataCache.current;
      }
      throw error;
    }
  }, [accessToken, normalizeProperties]);

  /**
   * Загружает нормализованные данные на карту
   */
  const loadGeoJSONData = useCallback<
    (
      map: mapboxgl.Map,
      forceRefresh?: boolean
    ) => Promise<EnrichedGridFeatureCollection>
  >(
    async (map, forceRefresh = false) => {
      if (!map.isStyleLoaded()) {
        await new Promise<void>((resolve) => {
          const wait = () =>
            map.isStyleLoaded() ? resolve() : setTimeout(wait, 100);
          wait();
        });
      }

      // If we already have the source and we're not forcing a refresh, just update it
      const shouldUpdateSource = map.getSource("areas") && !forceRefresh;

      const data = await fetchGeoJSONData();

      if (shouldUpdateSource) {
        // Just update the data in the existing source without removing/readding layers
        // This prevents flickering
        const source = map.getSource("areas") as
          | mapboxgl.GeoJSONSource
          | undefined;
        if (source && "setData" in source) {
          source.setData(data);
          console.log("Updated existing map source without reloading layers");
        }
      } else {
        // Remove layers and source if they exist
        const layersToRemove = ["area-fill", "area-outline", "area-hover"];
        for (const layer of layersToRemove) {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        }

        if (map.getSource("areas")) {
          map.removeSource("areas");
        }

        // Add the new source
        map.addSource("areas", {
          type: "geojson",
          data,
        });
        console.log("Created new map source");
      }

      return data;
    },
    [fetchGeoJSONData]
  );

  return { fetchGeoJSONData, loadGeoJSONData };
};

export default useGeoJSONData;
