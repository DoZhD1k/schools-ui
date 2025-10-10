"use client";

import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { SchoolsMapService } from "@/services/schools-map.service";
import type { SchoolFeature } from "@/types/schools-map";

interface SchoolsLayerProps {
  mapInstance: mapboxgl.Map;
}

export default function SchoolsLayer({ mapInstance }: SchoolsLayerProps) {
  const [schools, setSchools] = useState<SchoolFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("🏫 SchoolsLayer render:", {
    mapInstanceReady: !!mapInstance,
    schoolsCount: schools.length,
    isLoading,
    error,
  });

  // Load schools data when component mounts
  useEffect(() => {
    const loadSchools = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Loading schools data...");
        const schoolsData = await SchoolsMapService.fetchSchools();
        setSchools(schoolsData);
        console.log(`✅ Loaded ${schoolsData.length} schools`);

        // Debug: Log first few schools to see API structure
        if (schoolsData.length > 0) {
          console.log("📊 First school sample:", {
            name: schoolsData[0].properties.organization_name,
            circle_color: schoolsData[0].properties.circle_color,
            circle_radius: schoolsData[0].properties.circle_radius,
            district: schoolsData[0].properties.district,
            coordinates: schoolsData[0].geometry.coordinates,
          });

          // Count schools with API styling data
          const withColors = schoolsData.filter(
            (s) => s.properties.circle_color
          ).length;
          const withRadius = schoolsData.filter(
            (s) => s.properties.circle_radius
          ).length;
          console.log(
            `🎨 Schools with API colors: ${withColors}/${schoolsData.length}`
          );
          console.log(
            `📏 Schools with API radius: ${withRadius}/${schoolsData.length}`
          );
        }
      } catch (err) {
        console.error("Error loading schools:", err);
        setError("Не удалось загрузить данные школ");
      } finally {
        setIsLoading(false);
      }
    };

    loadSchools();
  }, []);

  // Add schools to map
  useEffect(() => {
    const addSchoolsToMap = async () => {
      console.log("🗺️ SchoolsLayer useEffect - conditions check:", {
        mapInstance: !!mapInstance,
        mapLoaded: mapInstance?.loaded(),
        schoolsLength: schools.length,
      });

      if (!mapInstance) {
        console.log("❌ Early return from schools useEffect - no map instance");
        return;
      }

      // If no schools loaded yet, just return
      if (schools.length === 0) {
        console.log("ℹ️ No schools to display yet, waiting for data...");
        return;
      }

      // Wait for map to be fully loaded before adding layers
      if (!mapInstance.loaded()) {
        console.log("⏳ Map not fully loaded yet, waiting...");
        const onLoad = () => {
          console.log("✅ Map loaded, retrying schools layer creation");
          addSchoolsToMap();
        };
        mapInstance.once("load", onLoad);
        return;
      }

      console.log("✅ Creating schools layers with", schools.length, "schools");

      const SCHOOLS_SOURCE_ID = "schools-source";
      const SCHOOLS_POINTS_LAYER_ID = "schools-points";

      // Wait a bit for polygons to load first
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create GeoJSON FeatureCollection from schools
      const geojsonData = {
        type: "FeatureCollection" as const,
        features: schools.map((school) => ({
          ...school,
          id: school.id,
          properties: {
            ...school.properties,
            // Add computed properties for styling
            colorByStatus: getSchoolColor(school.properties.overload_status),
            sizeByCapacity: getSchoolSize(school.properties.total_capacity),
          },
        })),
      };

      console.log("🌐 Schools GeoJSON data created:", {
        type: geojsonData.type,
        featuresCount: geojsonData.features.length,
        firstFeature: geojsonData.features[0],
      });

      // Add source if it doesn't exist
      if (!mapInstance.getSource(SCHOOLS_SOURCE_ID)) {
        console.log("🔗 Adding new schools source:", SCHOOLS_SOURCE_ID);
        mapInstance.addSource(SCHOOLS_SOURCE_ID, {
          type: "geojson",
          data: geojsonData,
        });
      } else {
        console.log("🔄 Updating existing schools source:", SCHOOLS_SOURCE_ID);
        const source = mapInstance.getSource(
          SCHOOLS_SOURCE_ID
        ) as mapboxgl.GeoJSONSource;
        source.setData(geojsonData);
      }

      // Add points layer if it doesn't exist
      if (!mapInstance.getLayer(SCHOOLS_POINTS_LAYER_ID)) {
        console.log("🎯 Adding schools points layer:", SCHOOLS_POINTS_LAYER_ID);

        // Insert schools at the very top, just before symbol layers (labels)
        const layers = mapInstance.getStyle().layers;
        let insertBeforeId: string | undefined;

        // Look for the first symbol layer (labels) to insert just before it
        // This will put schools on top of all other elements except text labels
        for (const layer of layers) {
          if (layer.type === "symbol") {
            insertBeforeId = layer.id;
            break;
          }
        }

        console.log(
          `� Schools will be inserted ${
            insertBeforeId
              ? `before symbol layer: ${insertBeforeId}`
              : "on top (no symbol layers found)"
          }`
        );

        console.log(
          `� Current layer order (showing top 5):`,
          layers
            .slice(-5)
            .reverse()
            .map((l, i) => `${i + 1}. ${l.id} (${l.type})`)
            .join(", ")
        );

        mapInstance.addLayer({
          id: SCHOOLS_POINTS_LAYER_ID,
          type: "circle",
          source: SCHOOLS_SOURCE_ID,
          layout: {
            visibility: "visible",
          },
          paint: {
            // Color based on school type: international, private, public
            "circle-color": [
              "case",
              // Check if it's international school based on education type or language
              [
                "any",
                ["==", ["get", "education_type"], "International"],
                ["==", ["get", "education_type"], "Международная"],
                ["in", "English", ["coalesce", ["get", "language"], ""]],
                ["in", "French", ["coalesce", ["get", "language"], ""]],
                ["in", "German", ["coalesce", ["get", "language"], ""]],
              ],
              "#8b5cf6", // Purple for international schools
              // Check if it's private school
              ["boolean", ["get", "is_private"], false],
              "#f59e0b", // Orange for private schools
              "#22c55e", // Green for public schools (default)
            ],
            // Fixed size for all schools, independent of zoom level
            "circle-radius": 8,
            "circle-opacity": 0.9,
            "circle-stroke-width": 2, // Uniform border width for all schools
            "circle-stroke-color": [
              "case",
              // International schools - dark purple border
              [
                "any",
                ["==", ["get", "education_type"], "International"],
                ["==", ["get", "education_type"], "Международная"],
                ["in", "English", ["coalesce", ["get", "language"], ""]],
                ["in", "French", ["coalesce", ["get", "language"], ""]],
                ["in", "German", ["coalesce", ["get", "language"], ""]],
              ],
              "#6d28d9",
              // Private schools - dark orange border
              ["boolean", ["get", "is_private"], false],
              "#d97706",
              // Public schools - dark green border
              "#16a34a",
            ],
            "circle-stroke-opacity": 1.0,
          },
        }); // Insert at the very top (no insertBeforeId)
        console.log("✅ Schools points layer added successfully at the top");
      }

      // Add hover effect
      let popup: mapboxgl.Popup | null = null;

      const handleMouseEnter = (
        e: mapboxgl.MapMouseEvent & {
          features?: mapboxgl.MapboxGeoJSONFeature[];
        }
      ) => {
        if (!e.features || e.features.length === 0) return;

        console.log(
          "🖱️ School hover detected:",
          e.features[0].properties?.organization_name
        );
        mapInstance.getCanvas().style.cursor = "pointer";

        // Increase radius on hover - fixed size for all schools
        mapInstance.setPaintProperty(SCHOOLS_POINTS_LAYER_ID, "circle-radius", [
          "case",
          ["==", ["id"], e.features[0].id],
          12, // Fixed hover radius for all schools
          8, // Fixed normal radius for all schools
        ]);
      };

      const handleMouseLeave = () => {
        console.log("🖱️ School hover ended");
        mapInstance.getCanvas().style.cursor = "";

        // Reset radius to fixed size for all schools
        mapInstance.setPaintProperty(
          SCHOOLS_POINTS_LAYER_ID,
          "circle-radius",
          8
        );
      };

      const handleClick = (
        e: mapboxgl.MapMouseEvent & {
          features?: mapboxgl.MapboxGeoJSONFeature[];
        }
      ) => {
        if (!e.features || e.features.length === 0) return;

        // Stop event propagation to prevent polygon click
        e.preventDefault();
        e.originalEvent.stopPropagation();

        const feature = e.features[0];
        const school = schools.find((s) => s.id === feature.id);

        console.log("🎯 School clicked:", {
          featureId: feature.id,
          schoolFound: !!school,
          schoolName: school?.properties?.organization_name || "Unknown",
          clickPosition: e.lngLat,
        });

        if (school) {
          // Remove existing popup
          if (popup) {
            popup.remove();
          }

          // Create popup content
          const popupContent = createSchoolPopupContent(school);

          // Create and show popup
          popup = new mapboxgl.Popup({
            closeButton: true,
            maxWidth: "400px",
            className: "school-popup",
            offset: [0, -15], // Increased offset for better visibility
          })
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(mapInstance);

          popup.on("close", () => {
            console.log("🎯 School popup closed");
            popup = null;
          });

          console.log("✅ School popup created and added to map");
        } else {
          console.error("❌ School not found for feature ID:", feature.id);
        }
      };

      // Add event listeners
      mapInstance.on("mouseenter", SCHOOLS_POINTS_LAYER_ID, handleMouseEnter);
      mapInstance.on("mouseleave", SCHOOLS_POINTS_LAYER_ID, handleMouseLeave);
      mapInstance.on("click", SCHOOLS_POINTS_LAYER_ID, handleClick);

      // Cleanup function
      return () => {
        if (popup) {
          popup.remove();
        }

        mapInstance.off(
          "mouseenter",
          SCHOOLS_POINTS_LAYER_ID,
          handleMouseEnter
        );
        mapInstance.off(
          "mouseleave",
          SCHOOLS_POINTS_LAYER_ID,
          handleMouseLeave
        );
        mapInstance.off("click", SCHOOLS_POINTS_LAYER_ID, handleClick);
      };
    };

    addSchoolsToMap();
  }, [mapInstance, schools]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstance) {
        const layers = ["schools-points"];
        layers.forEach((layerId) => {
          if (mapInstance.getLayer(layerId)) {
            mapInstance.removeLayer(layerId);
          }
        });

        if (mapInstance.getSource("schools-source")) {
          mapInstance.removeSource("schools-source");
        }
      }
    };
  }, [mapInstance]);

  return null; // This component doesn't render anything visible
}

// Helper function to get school color based on status
function getSchoolColor(status: string | null): string {
  switch (status) {
    case "overloaded":
      return "#ef4444"; // Red
    case "balanced":
      return "#22c55e"; // Green
    case "underloaded":
      return "#3b82f6"; // Blue
    default:
      return "#9ca3af"; // Gray
  }
}

// Helper function to get school size based on capacity
function getSchoolSize(capacity: number | null): number {
  if (!capacity) return 4;
  if (capacity < 500) return 6;
  if (capacity < 1000) return 8;
  if (capacity < 1500) return 10;
  return 12;
}

// Helper function to create popup content
function createSchoolPopupContent(school: SchoolFeature): string {
  const props = school.properties;

  const getStatusText = (status: string | null) => {
    switch (status) {
      case "overloaded":
        return "Перегружена";
      case "balanced":
        return "Сбалансирована";
      case "underloaded":
        return "Недогружена";
      default:
        return "Неизвестно";
    }
  };

  const getStatusColor = (status: string | null) => {
    // Use API color if available, otherwise use status-based color
    if (props.circle_color) {
      return props.circle_color;
    }

    switch (status) {
      case "overloaded":
        return "#ef4444";
      case "balanced":
        return "#22c55e";
      case "underloaded":
        return "#3b82f6";
      default:
        return "#9ca3af";
    }
  };

  return `
    <div class="school-popup-content">
      <div class="school-popup-header">
        <h3 class="school-popup-title">${
          props.organization_name || "Школа"
        }</h3>
        <span class="school-type-badge ${
          props.is_private ? "private" : "public"
        }">
          ${props.is_private ? "Частная" : "Государственная"}
        </span>
      </div>
      
      <div class="school-popup-location">
        <div class="location-row">
          <span class="location-label">Район:</span>
          <span class="location-value">${props.district || "Не указан"}</span>
        </div>
        <div class="location-row">
          <span class="location-label">Адрес:</span>
          <span class="location-value">${
            props.micro_district || "Не указан"
          }</span>
        </div>
        ${
          props.note_from_list
            ? `
        <div class="location-row">
          <span class="location-label">Тип:</span>
          <span class="location-value">${props.note_from_list}</span>
        </div>
        `
            : ""
        }
      </div>

      <div class="school-popup-status">
        <span class="status-badge" style="background-color: ${getStatusColor(
          props.overload_status
        )}20; color: ${getStatusColor(props.overload_status)};">
          ${getStatusText(props.overload_status)}
        </span>
        ${
          props.rating
            ? `<span class="rating-value">★ ${props.rating}</span>`
            : ""
        }
      </div>

      <div class="school-popup-metrics">
        <div class="metric-row">
          <span class="metric-label">Вместимость:</span>
          <span class="metric-value">${
            props.total_capacity?.toLocaleString() || "Нет данных"
          }</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Учащихся:</span>
          <span class="metric-value">${
            props.actual_students?.toLocaleString() || "Нет данных"
          }</span>
        </div>
        ${
          props.education_type
            ? `
        <div class="metric-row">
          <span class="metric-label">Тип:</span>
          <span class="metric-value">${props.education_type}</span>
        </div>
        `
            : ""
        }
        ${
          props.deficit !== null && props.deficit > 0
            ? `
        <div class="metric-row deficit">
          <span class="metric-label">Дефицит:</span>
          <span class="metric-value">-${props.deficit}</span>
        </div>
        `
            : ""
        }
        ${
          props.surplus !== null && props.surplus > 0
            ? `
        <div class="metric-row surplus">
          <span class="metric-label">Избыток:</span>
          <span class="metric-value">+${props.surplus}</span>
        </div>
        `
            : ""
        }
      </div>

      ${
        props.circle_color || props.circle_radius
          ? `
      <div class="school-popup-debug">
        <div class="debug-title">🔧 API данные:</div>
        ${
          props.circle_color
            ? `<div class="debug-item">Цвет: <span style="color: ${props.circle_color}; font-weight: bold;">●</span> ${props.circle_color}</div>`
            : ""
        }
        ${
          props.circle_radius
            ? `<div class="debug-item">Радиус: ${props.circle_radius}px</div>`
            : ""
        }
      </div>
      `
          : ""
      }

      ${
        props.total_capacity && props.actual_students
          ? `
      <div class="school-popup-progress">
        <div class="progress-label">Загруженность: ${Math.round(
          (props.actual_students / props.total_capacity) * 100
        )}%</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${Math.min(
            (props.actual_students / props.total_capacity) * 100,
            100
          )}%; background-color: ${getStatusColor(
              props.overload_status
            )}"></div>
        </div>
      </div>
      `
          : ""
      }
    </div>

    <style>
      .school-popup-content {
        padding: 16px;
        min-width: 320px;
        font-family: system-ui, -apple-system, sans-serif;
      }

      .school-popup-header {
        margin-bottom: 12px;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 8px;
      }

      .school-popup-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 6px 0;
        color: #111827;
        line-height: 1.3;
      }

      .school-type-badge {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .school-type-badge.private {
        background: #fef3c7;
        color: #92400e;
      }

      .school-type-badge.public {
        background: #dbeafe;
        color: #1e40af;
      }

      .school-popup-location {
        margin-bottom: 12px;
      }

      .location-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 13px;
      }

      .location-label {
        color: #6b7280;
        font-weight: 500;
      }

      .location-value {
        color: #111827;
        text-align: right;
        max-width: 60%;
      }

      .school-popup-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .status-badge {
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 500;
      }

      .rating-value {
        font-size: 14px;
        font-weight: 600;
        color: #f59e0b;
      }

      .school-popup-metrics {
        margin-bottom: 12px;
      }

      .metric-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        padding: 3px 0;
        font-size: 13px;
      }

      .metric-row.deficit {
        color: #ef4444;
      }

      .metric-row.surplus {
        color: #22c55e;
      }

      .metric-label {
        color: #6b7280;
        font-weight: 500;
      }

      .metric-value {
        font-weight: 600;
        color: #111827;
      }

      .metric-row.deficit .metric-value,
      .metric-row.surplus .metric-value {
        font-weight: 700;
      }

      .school-popup-progress {
        margin-top: 12px;
      }

      .progress-label {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 4px;
        font-weight: 500;
      }

      .progress-bar {
        width: 100%;
        height: 6px;
        background: #e5e7eb;
        border-radius: 3px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        transition: width 0.3s ease;
        border-radius: 3px;
      }

      .school-popup-debug {
        margin-top: 12px;
        padding: 8px;
        background: #f8fafc;
        border-radius: 6px;
        border-left: 3px solid #3b82f6;
      }

      .debug-title {
        font-size: 12px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 4px;
      }

      .debug-item {
        font-size: 11px;
        color: #6b7280;
        font-family: monospace;
        margin-bottom: 2px;
      }
    </style>
  `;
}
