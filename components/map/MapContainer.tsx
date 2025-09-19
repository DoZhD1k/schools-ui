"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import useGeoJSONData from "@/hooks/useGeoJSONData";
import { useMapContext } from "@/contexts/map-context";
import { createPopupHtml } from "./MapPopup";
import type { FilterSpecification } from "mapbox-gl";
import { EnrichedGridProperties } from "@/types/geojson";

// Set Mapbox token from environment variable
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Almaty, Kazakhstan coordinates
const ALMATY_CENTER: [number, number] = [76.9286, 43.2567];
const DEFAULT_ZOOM = 11;

export default function MapContainer() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { loadGeoJSONData } = useGeoJSONData();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInitError, setMapInitError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const {
    activeMetric,
    colorScheme,
    visibleLayers,
    filterRange,
    setMapInstance,
    setMetricMaxValues,
    metricMaxValues,
  } = useMapContext();

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Check if Mapbox token is available
    if (!mapboxgl.accessToken) {
      setMapInitError(
        "No Mapbox access token found. Please set NEXT_PUBLIC_MAPBOX_TOKEN in your environment variables."
      );
      return;
    }

    try {
      console.log("Initializing Mapbox map centered on Almaty");

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11", // Using a light, minimal base map
        center: ALMATY_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
        failIfMajorPerformanceCaveat: false,
      });

      map.current.on("load", () => {
        console.log("Map loaded successfully");
        setMapLoaded(true);
        if (map.current) {
          setMapInstance(map.current);
        }
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
        setMapInitError(`Map error: ${e.error?.message || "Unknown error"}`);
      });

      // Add controls after map initialization
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.current.addControl(
        new mapboxgl.AttributionControl({ compact: true })
      );
    } catch (err) {
      console.error("Failed to initialize map:", err);
      setMapInitError(
        `Failed to initialize map: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [setMapInstance]);

  // Load GeoJSON data when map is ready (only once)
  useEffect(() => {
    if (!mapLoaded || !map.current || dataLoaded) return;

    const loadData = async () => {
      try {
        console.log("Loading initial GeoJSON data...");
        const data = await loadGeoJSONData(map.current!);
        console.log("GeoJSON data loaded successfully");

        // Calculate max values for all metrics and update the context
        const metricMaxValues: Record<string, number> = {};

        // Loop through all features to find max values
        data.features.forEach((feature) => {
          const properties = feature.properties;

          // Check each property that could be a metric
          Object.entries(properties).forEach(([key, value]) => {
            // Only process numeric values
            if (typeof value === "number") {
              // Initialize if not exists
              if (!metricMaxValues[key]) {
                metricMaxValues[key] = 0;
              }

              // Update max value if current value is higher
              if (value > metricMaxValues[key]) {
                metricMaxValues[key] = value;
              }
            }
          });
        });

        // Round max values to nearest nice number for better UX
        Object.keys(metricMaxValues).forEach((key) => {
          const value = metricMaxValues[key];
          // Round to nearest 10, 100, 1000, etc. based on magnitude
          const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
          metricMaxValues[key] = Math.ceil(value / magnitude) * magnitude;
        });

        // Update the context with the calculated max values
        if (typeof setMetricMaxValues === "function") {
          setMetricMaxValues(metricMaxValues);
        }

        // Add layers only if they don't exist
        if (!map.current!.getLayer("area-fill")) {
          console.log("Adding map layers...");

          // Add a layer for the area fill
          map.current!.addLayer({
            id: "area-fill",
            type: "fill",
            source: "areas",
            paint: {
              "fill-color": [
                "interpolate",
                ["linear"],
                ["get", activeMetric],
                0,
                colorScheme[0],
                500,
                colorScheme[1],
                1000,
                colorScheme[2],
                5000,
                colorScheme[3],
                10000,
                colorScheme[4],
              ],
              "fill-opacity": 0.7,
            },
          });

          // Add outline layer
          map.current!.addLayer({
            id: "area-outline",
            type: "line",
            source: "areas",
            paint: {
              "line-color": "#000",
              "line-width": 1,
              "line-opacity": 0.5,
            },
          });

          // Add a hover effect
          map.current!.addLayer({
            id: "area-hover",
            type: "fill",
            source: "areas",
            paint: {
              "fill-color": "#000",
              "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                0.3,
                0,
              ],
            },
          });

          // Fly to the bounds of the data
          const bounds = new mapboxgl.LngLatBounds();
          data.features.forEach((feature) => {
            if (feature.geometry.coordinates) {
              feature.geometry.coordinates.forEach((polygon) => {
                polygon.forEach((ring) => {
                  ring.forEach((coord) => {
                    bounds.extend(coord as [number, number]);
                  });
                });
              });
            }
          });

          if (!bounds.isEmpty()) {
            map.current!.fitBounds(bounds, {
              padding: 50,
              maxZoom: 13,
            });
          }

          console.log("Map layers added successfully");
        }

        setDataLoaded(true);
      } catch (error) {
        console.error("Failed to load map data:", error);
      }
    };

    loadData();
  }, [
    loadGeoJSONData,
    mapLoaded,
    activeMetric,
    colorScheme,
    setMetricMaxValues,
  ]);

  // Setup a periodic update that doesn't cause flicker
  useEffect(() => {
    if (!mapLoaded || !map.current || !dataLoaded) return;

    // Setup periodic quiet data refresh without rebuilding layers
    const refreshInterval = setInterval(async () => {
      if (map.current && document.visibilityState === "visible") {
        try {
          // This will just update the source data without recreating layers
          await loadGeoJSONData(map.current);
        } catch (err) {
          console.error("Background data refresh failed:", err);
        }
      }
    }, 2 * 60 * 1000); // Refresh every 2 minutes

    return () => clearInterval(refreshInterval);
  }, [mapLoaded, dataLoaded, loadGeoJSONData]);

  // Update layer visibility, color and filter based on context
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // 1. Update layer visibility
    const layers = {
      "area-fill": visibleLayers.includes("areas"),
      "area-outline": visibleLayers.includes("areas"),
      "area-hover": visibleLayers.includes("areas"),
    };

    Object.entries(layers).forEach(([layer, visible]) => {
      if (map.current!.getLayer(layer)) {
        map.current!.setLayoutProperty(
          layer,
          "visibility",
          visible ? "visible" : "none"
        );
      }
    });

    // 2. Update color expression with dynamic stops based on actual metric range
    if (map.current.getLayer("area-fill")) {
      // Get the max value for this metric from our context
      const maxValue = metricMaxValues[activeMetric] || 10000;

      // Create different distribution strategies based on max value
      let colorStops: Array<[number, string]>;

      if (maxValue <= 100) {
        // For very small ranges (0-100), create more granular distribution
        colorStops = [
          [0, colorScheme[0]],
          [maxValue * 0.1, colorScheme[1]], // 10% of max
          [maxValue * 0.25, colorScheme[2]], // 25% of max
          [maxValue * 0.5, colorScheme[3]], // 50% of max
          [maxValue, colorScheme[4]], // 100% of max
        ];
      } else if (maxValue <= 1000) {
        // For medium ranges (100-1000)
        colorStops = [
          [0, colorScheme[0]],
          [maxValue * 0.15, colorScheme[1]], // 15% of max
          [maxValue * 0.4, colorScheme[2]], // 40% of max
          [maxValue * 0.7, colorScheme[3]], // 70% of max
          [maxValue, colorScheme[4]], // 100% of max
        ];
      } else {
        // For large ranges (>1000), use slightly more logarithmic distribution
        colorStops = [
          [0, colorScheme[0]],
          [maxValue * 0.05, colorScheme[1]], // 5% of max
          [maxValue * 0.2, colorScheme[2]], // 20% of max
          [maxValue * 0.5, colorScheme[3]], // 50% of max
          [maxValue, colorScheme[4]], // 100% of max
        ];
      }

      // Build the interpolation expression for mapbox with proper typing
      const colorExpression: mapboxgl.ExpressionSpecification = [
        "interpolate",
        ["linear"],
        ["get", activeMetric],
        ...(colorStops.flat() as any),
      ];

      map.current.setPaintProperty("area-fill", "fill-color", colorExpression);

      console.log(
        `Updated color scale for ${activeMetric} with max value ${maxValue}`
      );
    }

    // 3. Apply filter based on range
    if (map.current.getLayer("area-fill")) {
      const filterExpression: FilterSpecification = [
        "all",
        [">=", ["get", activeMetric], filterRange.min],
        ["<=", ["get", activeMetric], filterRange.max],
      ];

      // Apply the same filter to all layers
      ["area-fill", "area-outline", "area-hover"].forEach((layerId) => {
        if (map.current!.getLayer(layerId)) {
          map.current!.setFilter(layerId, filterExpression);
        }
      });

      console.log(
        `Applied filter: ${activeMetric} between ${filterRange.min} and ${filterRange.max}`
      );
    }
  }, [
    activeMetric,
    colorScheme,
    visibleLayers,
    filterRange,
    mapLoaded,
    metricMaxValues,
  ]);

  // Add popup with improved styling aligned with Swiss design
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Variable to keep track of the current popup
    let popup: mapboxgl.Popup | null = null;
    // Keep track of the current feature ID
    let currentFeatureId: string | number | null = null;

    // Function to create a popup for a feature
    const createPopup = (
      e: mapboxgl.MapMouseEvent & {
        features?: mapboxgl.MapboxGeoJSONFeature[];
      }
    ) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const featureId = feature.id !== undefined ? feature.id : null;
        const properties = feature.properties as EnrichedGridProperties;

        // Always close the previous popup first
        if (popup) {
          popup.remove();
          popup = null;
        }

        // Update current feature ID
        currentFeatureId = featureId;

        // Use the exact click position for the popup
        const clickPosition = e.lngLat;

        // Get the HTML content for the popup
        const popupContent = createPopupHtml({
          properties,
          activeMetric,
        });

        // Create the popup with proper options
        const popupOptions: mapboxgl.PopupOptions = {
          closeButton: true,
          maxWidth: "300px",
          className: "map-popup", // Use a custom class for styling
          offset: [0, -10],
          anchor: "bottom" as mapboxgl.Anchor,
        };

        // Create popup at the click position
        popup = new mapboxgl.Popup(popupOptions)
          .setLngLat(clickPosition)
          .setHTML(popupContent)
          .addTo(map.current!);

        // Add CSS class for animation after the popup is added to the DOM
        requestAnimationFrame(() => {
          if (popup) {
            const popupElement = popup.getElement();
            if (popupElement) {
              setTimeout(() => {
                popupElement.classList.add("map-popup-visible");
              }, 10);
            }
          }
        });

        // When popup closes, reset the current feature ID
        popup.on("close", () => {
          currentFeatureId = null;
          popup = null;
        });
      }
    };

    // Simple cursor change on hover (no popup)
    const handleMouseEnter = (
      e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }
    ) => {
      if (!e.features || e.features.length === 0) return;
      map.current!.getCanvas().style.cursor = "pointer";
    };

    // Change cursor back to default when leaving a feature
    const handleMouseLeave = () => {
      map.current!.getCanvas().style.cursor = "";
    };

    // Show popup ONLY on click
    const handleClick = (
      e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }
    ) => {
      if (!e.features || e.features.length === 0) return;

      // If we're clicking the same feature that already has a popup, don't do anything
      if (
        e.features[0].id !== undefined &&
        e.features[0].id === currentFeatureId &&
        popup
      ) {
        return;
      }

      // Create new popup
      createPopup(e);
    };

    // Close popup when clicking elsewhere on the map
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      // Check if the click is not on a feature
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: ["area-fill"],
      });

      // Close popup when clicking outside areas
      if (features.length === 0 && popup) {
        popup.remove();
        popup = null;
        currentFeatureId = null;
      }
    };

    // Add event listeners - only hover for cursor change, click for popup
    map.current.on("mouseenter", "area-fill", handleMouseEnter);
    map.current.on("mouseleave", "area-fill", handleMouseLeave);
    map.current.on("click", "area-fill", handleClick);
    map.current.on("click", handleMapClick);

    return () => {
      // Clean up event listeners
      if (map.current) {
        map.current.off("mouseenter", "area-fill", handleMouseEnter);
        map.current.off("mouseleave", "area-fill", handleMouseLeave);
        map.current.off("click", "area-fill", handleClick);
        map.current.off("click", handleMapClick);
      }

      // Remove popup
      if (popup) {
        popup.remove();
      }
    };
  }, [mapLoaded, activeMetric]);

  return (
    <div className="relative w-full h-full">
      {mapInitError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background text-red-500 p-4 z-20">
          <div className="bg-white p-6 rounded shadow-lg max-w-md border-l-4 border-red-500">
            <h3 className="font-medium text-lg mb-2 uppercase tracking-wide">
              Map Error
            </h3>
            <p className="mb-4">{mapInitError}</p>
            <p className="text-sm text-muted-foreground">
              Please check your Mapbox access token in the environment
              variables.
            </p>
          </div>
        </div>
      )}
      <div
        ref={mapContainer}
        className="absolute inset-0 bg-background"
        style={{ visibility: mapInitError ? "hidden" : "visible" }}
      />
    </div>
  );
}
