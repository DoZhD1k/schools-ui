"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { SchoolsMapService } from "@/services/schools-map.service";
import { SchoolFeature } from "@/types/schools-map";
import { School } from "@/types/schools";

interface SchoolMarkersLayerProps {
  mapInstance: mapboxgl.Map;
  filteredSchools?: SchoolFeature[];
  onSchoolSelect?: (school: SchoolFeature) => void;
  schoolsWithRatings?: School[];
}

const SCHOOLS_MARKERS_SOURCE_ID = "schools-markers";
const SCHOOLS_MARKERS_LAYER_ID = "schools-markers";

export default function SchoolMarkersLayer({
  mapInstance,
  filteredSchools,
  onSchoolSelect,
  schoolsWithRatings,
}: SchoolMarkersLayerProps) {
  const [schools, setSchools] = useState<SchoolFeature[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const popup = useRef<mapboxgl.Popup | null>(null);

  // Используем переданные отфильтрованные школы или загружаем все
  const activeSchools = filteredSchools || schools;

  // Загрузка данных школ (только если не переданы отфильтрованные)
  useEffect(() => {
    if (filteredSchools) {
      console.log("🏫 Using filtered schools:", filteredSchools.length);
      return; // Не загружаем, если переданы отфильтрованные
    }

    const loadSchools = async () => {
      try {
        console.log("🏫 Loading schools data from API...");
        const allSchools = await SchoolsMapService.fetchSchools();

        if (allSchools && allSchools.length > 0) {
          // Фильтруем школы с координатами (origin_marker)
          const schoolsWithCoordinates = allSchools
            .filter((schoolFeature: SchoolFeature) => {
              // Проверяем наличие координат в infra.origin_marker
              const school = schoolFeature.properties;
              const hasMarker =
                school.infra?.origin_marker?.coordinates &&
                Array.isArray(school.infra.origin_marker.coordinates) &&
                school.infra.origin_marker.coordinates.length === 2 &&
                typeof school.infra.origin_marker.coordinates[0] === "number" &&
                typeof school.infra.origin_marker.coordinates[1] === "number";

              if (hasMarker) {
                console.log("📍 School with coordinates:", {
                  id: school.id,
                  name: school.name_of_the_organization,
                  coordinates: school.infra!.origin_marker.coordinates,
                });
                return true;
              }
              return false;
            })
            .map((schoolFeature: SchoolFeature) => {
              // Преобразуем данные в формат SchoolFeature с Point геометрией
              const school = schoolFeature.properties;
              return {
                type: "Feature" as const,
                id: school.id,
                geometry: {
                  type: "Point" as const,
                  coordinates: school.infra!.origin_marker.coordinates as [
                    number,
                    number
                  ],
                },
                properties: {
                  id: school.id,
                  name_of_the_organization: school.name_of_the_organization,
                  types_of_educational_institutions:
                    school.types_of_educational_institutions,
                  form_of_ownership: school.form_of_ownership,
                  departmental_affiliation: school.departmental_affiliation,
                  contingency_filter: school.contingency_filter,
                  group_of_school: school.group_of_school,
                  is_closed_sign: school.is_closed_sign,
                  gis_rating: school.gis_rating,
                  region: school.region,
                  district: school.district,
                },
              } as SchoolFeature;
            });

          console.log(
            `🎯 Loaded ${schoolsWithCoordinates.length} schools with coordinates out of ${allSchools.length} total schools`
          );
          setSchools(schoolsWithCoordinates);
        } else {
          console.warn("⚠️ No schools data received");
          setSchools([]);
        }
      } catch (err) {
        console.error("❌ Error loading schools:", err);
        setSchools([]);
      }
    };

    loadSchools();
  }, [filteredSchools]);

  // Функция для получения цвета маркера школы
  const getSchoolMarkerColor = useCallback(
    (school: SchoolFeature): string => {
      // Найдем школу с рейтингом по ID или названию
      const schoolWithRating = schoolsWithRatings?.find(
        (s) =>
          s.id === school.id.toString() ||
          s.nameRu === school.properties.name_of_the_organization
      );

      // Используем новый рейтинг если найден
      if (schoolWithRating?.currentRating) {
        const rating = schoolWithRating.currentRating;
        if (rating >= 86) return "#10B981"; // Зеленый для зоны 86-100%
        if (rating >= 50) return "#F59E0B"; // Желтый для зоны 50-85%
        if (rating >= 5) return "#EF4444"; // Красный для зоны 5-49%
      }

      // Fallback к старому рейтингу если новый не найден
      const gisRating = school.properties.gis_rating;
      if (gisRating) {
        if (gisRating >= 4.0) return "#10B981"; // Зеленый для высокого рейтинга
        if (gisRating >= 3.0) return "#F59E0B"; // Желтый для среднего рейтинга
        return "#EF4444"; // Красный для низкого рейтинга
      }

      // По типу собственности если нет рейтинга
      if (school.properties.form_of_ownership?.includes("граждан")) {
        return "#F97316"; // Оранжевый для частных
      }
      return "#6366F1"; // Индиго для государственных/прочих
    },
    [schoolsWithRatings]
  );

  // Функция для получения размера маркера
  const getSchoolMarkerSize = useCallback((school: SchoolFeature): number => {
    const contingent = school.properties.contingency_filter;
    if (contingent) {
      if (contingent >= 1000) return 12; // Большие школы
      if (contingent >= 500) return 10; // Средние школы
      if (contingent >= 200) return 8; // Маленькие школы
      return 6; // Очень маленькие школы
    }
    return 8; // Размер по умолчанию
  }, []);

  // Создание содержимого popup для школы
  // const createSchoolPopupContent = (school: SchoolFeature): string => {
  //   const props = school.properties;

  //   const getTypeLabel = () => {
  //     if (
  //       props.types_of_educational_institutions
  //         ?.toLowerCase()
  //         .includes("международн")
  //     ) {
  //       return '<span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">МЕЖДУНАРОДНАЯ</span>';
  //     }
  //     return props.form_of_ownership?.includes("граждан")
  //       ? '<span class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">ЧАСТНАЯ</span>'
  //       : '<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">ГОСУДАРСТВЕННАЯ</span>';
  //   };

  //   const getStatusBadge = () => {
  //     if (props.is_closed_sign) {
  //       return '<span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Закрыта</span>';
  //     } else {
  //       return '<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Активна</span>';
  //     }
  //   };

  //   const getRatingBadge = () => {
  //     const rating = props.gis_rating;
  //     if (rating) {
  //       const color =
  //         rating >= 4.0 ? "green" : rating >= 3.0 ? "yellow" : "red";
  //       const bgColor =
  //         color === "green"
  //           ? "bg-green-100 text-green-800"
  //           : color === "yellow"
  //           ? "bg-yellow-100 text-yellow-800"
  //           : "bg-red-100 text-red-800";
  //       return `<span class="${bgColor} px-2 py-1 rounded text-xs font-medium">★ ${rating.toFixed(
  //         1
  //       )}</span>`;
  //     }
  //     return '<span class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Рейтинг не указан</span>';
  //   };

  //   return `
  //     <div class="school-marker-popup" style="min-width: 320px; font-family: system-ui, -apple-system, sans-serif;">
  //       <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px;">
  //         <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937; line-height: 1.3;">
  //           ${props.name_of_the_organization}
  //         </h3>
  //         <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
  //           ${getTypeLabel()}
  //           ${getStatusBadge()}
  //           ${getRatingBadge()}
  //         </div>
  //       </div>

  //       <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
  //         <div>
  //           <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Район</div>
  //           <div style="font-size: 14px; font-weight: 500; color: #374151;">
  //             ${props.district || "Не указан"}
  //           </div>
  //         </div>
  //         <div>
  //           <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Контингент</div>
  //           <div style="font-size: 14px; font-weight: 500; color: #374151;">
  //             ${
  //               props.contingency_filter
  //                 ? props.contingency_filter.toLocaleString()
  //                 : "—"
  //             }
  //           </div>
  //         </div>
  //       </div>

  //       <div style="margin-bottom: 12px;">
  //         <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Тип школы</div>
  //         <div style="font-size: 14px; color: #374151;">${
  //           props.group_of_school || "—"
  //         }</div>
  //       </div>

  //       <div style="margin-bottom: 12px;">
  //         <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Тип образования</div>
  //         <div style="font-size: 14px; color: #374151;">${
  //           props.types_of_educational_institutions || "Не указан"
  //         }</div>
  //       </div>

  //       <div style="margin-bottom: 12px;">
  //         <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Форма собственности</div>
  //         <div style="font-size: 14px; color: #374151;">${
  //           props.form_of_ownership || "Не указана"
  //         }</div>
  //       </div>
  //     </div>
  //   `;
  // };

  // Инициализация слоя при наличии данных
  useEffect(() => {
    if (!mapInstance || isInitialized) return;

    const initializeMarkerLayer = async () => {
      try {
        console.log("🎨 Initializing school markers layer...");

        // Создание пустого GeoJSON источника - данные добавим позже
        const emptyGeojsonData: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: [],
        };

        // Добавляем источник данных
        if (!mapInstance.getSource(SCHOOLS_MARKERS_SOURCE_ID)) {
          mapInstance.addSource(SCHOOLS_MARKERS_SOURCE_ID, {
            type: "geojson",
            data: emptyGeojsonData,
          });
          console.log("✅ School markers source added (empty)");
        }

        // Добавляем слой маркеров
        if (!mapInstance.getLayer(SCHOOLS_MARKERS_LAYER_ID)) {
          mapInstance.addLayer({
            id: SCHOOLS_MARKERS_LAYER_ID,
            type: "circle",
            source: SCHOOLS_MARKERS_SOURCE_ID,
            layout: {
              visibility: "visible",
            },
            paint: {
              "circle-radius": [
                "case",
                ["!=", ["get", "markerSize"], null],
                ["get", "markerSize"],
                8, // Размер по умолчанию
              ],
              "circle-color": [
                "case",
                ["!=", ["get", "markerColor"], null],
                ["get", "markerColor"],
                "#6366F1", // Цвет по умолчанию
              ],
              "circle-opacity": 0.8,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#FFFFFF",
              "circle-stroke-opacity": 1,
            },
          });

          console.log("✅ School markers layer added");
        }

        setIsInitialized(true);
        console.log("🎉 School markers layer initialized successfully");
      } catch (err) {
        console.error("❌ Error initializing school markers layer:", err);
      }
    };

    const timeoutId = setTimeout(initializeMarkerLayer, 100);
    return () => clearTimeout(timeoutId);
  }, [mapInstance, isInitialized]);

  // Обработчики событий мыши
  useEffect(() => {
    if (!mapInstance || !isInitialized) return;

    const handleMouseEnter = () => {
      mapInstance.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      mapInstance.getCanvas().style.cursor = "";
    };

    const handleClick = (
      e: mapboxgl.MapMouseEvent & {
        features?: mapboxgl.MapboxGeoJSONFeature[];
      }
    ) => {
      if (!e.features || e.features.length === 0) return;

      e.preventDefault();
      e.originalEvent.stopPropagation();

      const feature = e.features[0];
      const school = activeSchools.find((s) => s.id === feature.id);

      console.log("🎯 School marker clicked:", {
        featureId: feature.id,
        schoolFound: !!school,
        schoolName: school?.properties?.name_of_the_organization || "Unknown",
        clickPosition: e.lngLat,
      });

      if (school) {
        // Вызываем коллбек для выбора школы
        if (onSchoolSelect) {
          onSchoolSelect(school);
        }

        if (popup.current) {
          popup.current.remove();
        }

        // Показываем маленький popup с названием школы
        const popupContent = `
          <div style="padding: 8px 12px; font-size: 14px; font-weight: 500; color: #374151;">
            ${school.properties.name_of_the_organization}
          </div>
        `;

        popup.current = new mapboxgl.Popup({
          closeButton: false,
          maxWidth: "300px",
          className: "school-marker-popup-small",
          offset: [0, -10],
        })
          .setLngLat(e.lngLat)
          .setHTML(popupContent)
          .addTo(mapInstance);
      }
    };

    // Добавляем обработчики событий
    if (mapInstance.getLayer(SCHOOLS_MARKERS_LAYER_ID)) {
      mapInstance.on("mouseenter", SCHOOLS_MARKERS_LAYER_ID, handleMouseEnter);
      mapInstance.on("mouseleave", SCHOOLS_MARKERS_LAYER_ID, handleMouseLeave);
      mapInstance.on("click", SCHOOLS_MARKERS_LAYER_ID, handleClick);
    }

    return () => {
      if (popup.current) {
        popup.current.remove();
        popup.current = null;
      }

      if (mapInstance && mapInstance.getLayer) {
        try {
          if (mapInstance.getLayer(SCHOOLS_MARKERS_LAYER_ID)) {
            mapInstance.off(
              "mouseenter",
              SCHOOLS_MARKERS_LAYER_ID,
              handleMouseEnter
            );
            mapInstance.off(
              "mouseleave",
              SCHOOLS_MARKERS_LAYER_ID,
              handleMouseLeave
            );
            mapInstance.off("click", SCHOOLS_MARKERS_LAYER_ID, handleClick);
          }
        } catch (error) {
          console.warn("⚠️ Error removing event listeners:", error);
        }
      }
    };
  }, [mapInstance, isInitialized, activeSchools, onSchoolSelect]);

  // Обновление данных слоя при изменении отфильтрованных школ
  useEffect(() => {
    if (!mapInstance || !isInitialized) return;

    const updateLayerData = () => {
      try {
        console.log(
          "🔄 Updating school markers data with",
          activeSchools.length,
          "schools"
        );

        const geojsonData: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: activeSchools
            .filter((school) => {
              // Проверяем наличие origin_marker в свойствах школы
              const hasMarker =
                school.properties?.infra?.origin_marker?.coordinates &&
                Array.isArray(
                  school.properties.infra.origin_marker.coordinates
                ) &&
                school.properties.infra.origin_marker.coordinates.length === 2;

              if (!hasMarker) {
                console.log("⚠️ School without marker:", {
                  id: school.id,
                  name: school.properties?.name_of_the_organization,
                  geometryType: school.geometry?.type,
                  hasInfra: !!school.properties?.infra,
                  hasOriginMarker: !!school.properties?.infra?.origin_marker,
                });
              }

              return hasMarker;
            })
            .map((school) => ({
              type: "Feature" as const,
              id: school.id,
              geometry: {
                type: "Point" as const,
                coordinates: school.properties.infra!.origin_marker.coordinates,
              } as GeoJSON.Point,
              properties: {
                ...school.properties,
                markerColor: getSchoolMarkerColor(school),
                markerSize: getSchoolMarkerSize(school),
              },
            })),
        };

        console.log("📍 Markers data to update:", {
          totalSchools: activeSchools.length,
          schoolsWithMarkers: activeSchools.filter(
            (s) => s.properties?.infra?.origin_marker?.coordinates
          ).length,
          features: geojsonData.features.length,
          sampleFeature: geojsonData.features[0]
            ? {
                id: geojsonData.features[0].id,
                coordinates: (geojsonData.features[0].geometry as GeoJSON.Point)
                  .coordinates,
                color: geojsonData.features[0].properties?.markerColor,
                size: geojsonData.features[0].properties?.markerSize,
              }
            : null,
        });

        const source = mapInstance.getSource(
          SCHOOLS_MARKERS_SOURCE_ID
        ) as mapboxgl.GeoJSONSource;
        if (source) {
          source.setData(geojsonData);
          console.log(
            "✅ School markers data updated successfully with",
            geojsonData.features.length,
            "markers"
          );
        } else {
          console.warn("⚠️ School markers source not found for update");
        }
      } catch (error) {
        console.error("❌ Error updating school markers data:", error);
      }
    };

    updateLayerData();
  }, [
    activeSchools,
    mapInstance,
    isInitialized,
    onSchoolSelect,
    getSchoolMarkerColor,
    getSchoolMarkerSize,
  ]);

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      if (!mapInstance || !mapInstance.getLayer) return;

      try {
        if (mapInstance.getLayer(SCHOOLS_MARKERS_LAYER_ID)) {
          mapInstance.removeLayer(SCHOOLS_MARKERS_LAYER_ID);
        }

        if (mapInstance.getSource(SCHOOLS_MARKERS_SOURCE_ID)) {
          mapInstance.removeSource(SCHOOLS_MARKERS_SOURCE_ID);
        }
      } catch (error) {
        console.warn("⚠️ Error during school markers cleanup:", error);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* Стили для маленького popup */}
      <style jsx global>{`
        .school-marker-popup-small .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid #e5e7eb !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(8px) !important;
          font-family: system-ui, -apple-system, sans-serif !important;
        }

        .school-marker-popup-small .mapboxgl-popup-tip {
          border-top-color: rgba(255, 255, 255, 0.95) !important;
          border-width: 6px !important;
        }
      `}</style>
    </>
  );
}
