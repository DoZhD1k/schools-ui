"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { SchoolsMapService } from "@/services/schools-map.service";
import { SchoolFeature } from "@/types/schools-map";

interface SchoolPolygonsLayerProps {
  mapInstance: mapboxgl.Map;
  filteredSchools?: SchoolFeature[];
}

const SCHOOLS_POLYGONS_SOURCE_ID = "schools-polygons";
const SCHOOLS_POLYGONS_FILL_LAYER_ID = "schools-polygons-fill";
const SCHOOLS_POLYGONS_STROKE_LAYER_ID = "schools-polygons-stroke";
const SCHOOLS_POLYGONS_HOVER_LAYER_ID = "schools-polygons-hover";

export default function SchoolPolygonsLayer({
  mapInstance,
  filteredSchools,
}: SchoolPolygonsLayerProps) {
  const [schools, setSchools] = useState<SchoolFeature[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const hoveredSchoolId = useRef<string | number | null>(null);

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
          // Фильтруем только школы с полигонами
          const polygonSchools = allSchools.filter((school: SchoolFeature) => {
            if (
              school.geometry.type === "MultiPolygon" &&
              school.geometry.coordinates &&
              school.geometry.coordinates.length > 0
            ) {
              const coords = school.geometry.coordinates as [
                number,
                number
              ][][][];
              console.log("📐 School geometry:", {
                id: school.id,
                name: school.properties.name_of_the_organization,
                type: school.geometry.type,
                coordinatesLength: coords.length,
                firstPolygonRings: coords[0]?.length,
                firstRingPoints: coords[0]?.[0]?.length,
                samplePoints: coords[0]?.[0]?.slice(0, 5), // Первые 5 точек для проверки
              });

              // Проверяем, что геометрия корректная
              if (
                coords.length > 0 &&
                coords[0].length > 0 &&
                coords[0][0].length >= 4
              ) {
                return true;
              }
            }
            return false;
          });

          console.log(
            `🎯 Loaded ${polygonSchools.length} schools with polygons out of ${allSchools.length} total schools`
          );
          setSchools(polygonSchools);
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

  // Функция для получения цвета полигона школы
  const getSchoolPolygonColor = useCallback((school: SchoolFeature): string => {
    // По типу собственности
    if (school.properties.form_of_ownership?.includes("граждан")) {
      return "#F97316"; // Оранжевый для частных
    } else {
      return "#10B981"; // Зеленый для государственных
    }
  }, []);

  // Функция для получения цвета обводки
  const getSchoolStrokeColor = useCallback(
    (school: SchoolFeature): string => {
      // Более темная и контрастная версия цвета заливки
      const fillColor = getSchoolPolygonColor(school);
      const colorMap: { [key: string]: string } = {
        "#F97316": "#C2410C", // Более темный оранжевый для частных
        "#10B981": "#047857", // Более темный зеленый для государственных
      };

      return colorMap[fillColor] || "#1F2937";
    },
    [getSchoolPolygonColor]
  );

  // Создание содержимого popup для школы
  const createSchoolPopupContent = (school: SchoolFeature): string => {
    const props = school.properties;

    const getTypeLabel = () => {
      if (
        props.types_of_educational_institutions
          ?.toLowerCase()
          .includes("международн")
      ) {
        return '<span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">МЕЖДУНАРОДНАЯ</span>';
      }
      return props.form_of_ownership?.includes("граждан")
        ? '<span class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">ЧАСТНАЯ</span>'
        : '<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">ГОСУДАРСТВЕННАЯ</span>';
    };

    const getStatusBadge = () => {
      if (props.is_closed_sign) {
        return '<span class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Закрыта</span>';
      } else {
        return '<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Активна</span>';
      }
    };

    return `
      <div class="school-polygon-popup" style="min-width: 320px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937; line-height: 1.3;">
            ${props.name_of_the_organization}
          </h3>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
            ${getTypeLabel()}
            ${getStatusBadge()}
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Район</div>
            <div style="font-size: 14px; font-weight: 500; color: #374151;">
              ${props.district || "Не указан"}
            </div>
          </div>
          <div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Рейтинг GIS</div>
            <div style="font-size: 14px; font-weight: 500; color: #374151;">
              ${props.gis_rating ? props.gis_rating.toFixed(1) : "—"}
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Контингент</div>
            <div style="font-size: 14px; font-weight: 600; color: #1f2937;">
              ${props.contingency_filter || "—"}
            </div>
          </div>
          <div>
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Тип школы</div>
            <div style="font-size: 14px; font-weight: 600; color: #1f2937;">
              ${props.group_of_school || "—"}
            </div>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Тип образования</div>
          <div style="font-size: 14px; color: #374151;">${
            props.types_of_educational_institutions || "Не указан"
          }</div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Форма собственности</div>
          <div style="font-size: 14px; color: #374151;">${
            props.form_of_ownership || "Не указана"
          }</div>
        </div>
      </div>
    `;
  };

  // Инициализация слоев при наличии данных
  useEffect(() => {
    if (!activeSchools.length || !mapInstance || isInitialized) return;

    const initializeLayers = async () => {
      try {
        console.log("🎨 Initializing school polygons layers...");

        // Создание GeoJSON данных с валидацией
        const geojsonData: GeoJSON.FeatureCollection = {
          type: "FeatureCollection",
          features: activeSchools.map((school) => {
            // Валидируем и нормализуем геометрию
            let geometry: GeoJSON.Geometry =
              school.geometry as GeoJSON.Geometry;

            if (school.geometry.type === "MultiPolygon") {
              const coords = school.geometry.coordinates as [
                number,
                number
              ][][][];

              console.log(`📍 Processing school ${school.id} geometry:`, {
                name: school.properties.name_of_the_organization,
                polygonCount: coords.length,
                firstPolygonRings: coords[0]?.length,
                firstRingPoints: coords[0]?.[0]?.length,
                sampleCoords: coords[0]?.[0]?.slice(0, 3),
                firstPoint: coords[0]?.[0]?.[0],
              });

              // Проверяем каждый полигон в MultiPolygon
              const validatedCoords = coords.map((polygon, polygonIndex) => {
                return polygon.map((ring, ringIndex) => {
                  // Убеждаемся, что кольцо замкнуто (первая и последняя точки одинаковые)
                  if (ring.length >= 4) {
                    const firstPoint = ring[0];
                    const lastPoint = ring[ring.length - 1];

                    if (
                      firstPoint[0] !== lastPoint[0] ||
                      firstPoint[1] !== lastPoint[1]
                    ) {
                      // Замыкаем кольцо, добавляя первую точку в конец
                      ring.push([firstPoint[0], firstPoint[1]]);
                      console.log(
                        `🔧 Closed ring for polygon ${polygonIndex}, ring ${ringIndex}`
                      );
                    }
                  } else {
                    console.warn(
                      `⚠️ Ring too short for polygon ${polygonIndex}, ring ${ringIndex}: ${ring.length} points`
                    );
                  }
                  return ring;
                });
              });

              geometry = {
                type: "MultiPolygon",
                coordinates: validatedCoords,
              };

              console.log("✅ Validated geometry for school:", school.id, {
                originalRings: coords.length,
                validatedRings: validatedCoords.length,
                totalPoints: validatedCoords.reduce(
                  (sum, poly) =>
                    sum +
                    poly.reduce((ringSum, ring) => ringSum + ring.length, 0),
                  0
                ),
              });
            }

            return {
              type: "Feature",
              id: school.id,
              geometry: geometry,
              properties: {
                ...school.properties,
                polygonColor: getSchoolPolygonColor(school),
                strokeColor: getSchoolStrokeColor(school),
              },
            };
          }),
        };

        console.log("🗺️ Created GeoJSON data:", {
          totalFeatures: geojsonData.features.length,
          sampleFeature: geojsonData.features[0]
            ? {
                id: geojsonData.features[0].id,
                geometryType: geojsonData.features[0].geometry.type,
                hasCoordinates:
                  geojsonData.features[0].geometry.type !==
                  "GeometryCollection",
                polygonColor: geojsonData.features[0].properties?.polygonColor,
                strokeColor: geojsonData.features[0].properties?.strokeColor,
              }
            : null,
        });

        // Добавляем источник данных
        if (!mapInstance.getSource(SCHOOLS_POLYGONS_SOURCE_ID)) {
          console.log("📦 Adding school polygons source with data:", {
            featureCount: geojsonData.features.length,
            firstFeature: geojsonData.features[0],
          });

          mapInstance.addSource(SCHOOLS_POLYGONS_SOURCE_ID, {
            type: "geojson",
            data: geojsonData,
          });
          console.log(
            "✅ School polygons source added with",
            geojsonData.features.length,
            "features"
          );

          // Проверяем что данные добавились корректно
          setTimeout(() => {
            const source = mapInstance.getSource(
              SCHOOLS_POLYGONS_SOURCE_ID
            ) as mapboxgl.GeoJSONSource;
            if (source) {
              console.log("🔍 Source verification successful");

              // Дополнительная проверка данных
              const bounds = new mapboxgl.LngLatBounds();
              geojsonData.features.forEach((feature) => {
                if (feature.geometry.type === "MultiPolygon") {
                  const coords = feature.geometry.coordinates as [
                    number,
                    number
                  ][][][];
                  coords.forEach((polygon) => {
                    polygon.forEach((ring) => {
                      ring.forEach((point) => {
                        bounds.extend([point[0], point[1]]);
                      });
                    });
                  });
                }
              });
              console.log("📏 Polygons bounds:", bounds.toArray());
            }
          }, 100);
        }

        // Добавляем слой заливки В САМОМ ВЕРХУ
        if (!mapInstance.getLayer(SCHOOLS_POLYGONS_FILL_LAYER_ID)) {
          // Сначала добавляем без beforeLayerId - попадет в самый верх
          mapInstance.addLayer({
            id: SCHOOLS_POLYGONS_FILL_LAYER_ID,
            type: "fill",
            source: SCHOOLS_POLYGONS_SOURCE_ID,
            layout: {
              visibility: "visible",
            },
            paint: {
              "fill-color": [
                "case",
                ["!=", ["get", "polygonColor"], null],
                ["get", "polygonColor"],
                "#1e3a8a", // Темно-синий цвет для школьных полигонов
              ],
              "fill-opacity": 0.25, // Более прозрачные полигоны для лучшего восприятия
            },
          });

          console.log("✅ School polygons fill layer added ON TOP");
        }

        // Добавляем слой обводки В САМОМ ВЕРХУ
        if (!mapInstance.getLayer(SCHOOLS_POLYGONS_STROKE_LAYER_ID)) {
          mapInstance.addLayer({
            id: SCHOOLS_POLYGONS_STROKE_LAYER_ID,
            type: "line",
            source: SCHOOLS_POLYGONS_SOURCE_ID,
            layout: {
              visibility: "visible",
            },
            paint: {
              "line-color": [
                "case",
                ["!=", ["get", "strokeColor"], null],
                ["get", "strokeColor"],
                "#1e40af", // Темно-синий цвет обводки для школьных полигонов
              ],
              "line-width": 1.5, // Тонкие границы для мест расположения школ
              "line-opacity": 0.7, // Умеренная прозрачность границ
            },
          });

          console.log("✅ School polygons stroke layer added ON TOP");
        }

        // Добавляем слой для hover эффектов
        if (!mapInstance.getLayer(SCHOOLS_POLYGONS_HOVER_LAYER_ID)) {
          mapInstance.addLayer({
            id: SCHOOLS_POLYGONS_HOVER_LAYER_ID,
            type: "fill",
            source: SCHOOLS_POLYGONS_SOURCE_ID,
            layout: {
              visibility: "visible",
            },
            paint: {
              "fill-color": "#1e3a8a", // Темно-синий цвет для hover эффекта
              "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                0.4, // Более прозрачный hover эффект
                0,
              ],
            },
          });

          console.log("✅ School polygons hover layer added");
        }

        setIsInitialized(true);
        console.log("🎉 School polygons layers initialized successfully");

        // Перемещаем слои школ на самый верх карты
        setTimeout(() => {
          moveSchoolLayersToTop();
        }, 1000); // Увеличена задержка до 1 секунды

        // Дополнительные проверки через интервалы для гарантии правильного порядка
        setTimeout(() => {
          console.log("🔄 Additional check: moving school layers to top");
          moveSchoolLayersToTop();

          // Дополнительно пробуем moveLayer API для принудительного перемещения в конец
          const schoolLayers = [
            SCHOOLS_POLYGONS_FILL_LAYER_ID,
            SCHOOLS_POLYGONS_STROKE_LAYER_ID,
            SCHOOLS_POLYGONS_HOVER_LAYER_ID,
          ];

          schoolLayers.forEach((layerId) => {
            if (mapInstance.getLayer(layerId)) {
              try {
                // Пробуем использовать moveLayer если доступен
                if (typeof mapInstance.moveLayer === "function") {
                  mapInstance.moveLayer(layerId);
                  console.log(`🔄 Used moveLayer for ${layerId}`);
                }
              } catch {
                console.log(`ℹ️ moveLayer not available for ${layerId}`);
              }
            }
          });
        }, 2000);

        setTimeout(() => {
          console.log("🔄 Final check: moving school layers to top");
          moveSchoolLayersToTop();
        }, 3000);
      } catch (err) {
        console.error("❌ Error initializing school polygons layers:", err);
      }
    };

    // Функция для перемещения слоев школ на самый верх карты
    const moveSchoolLayersToTop = () => {
      try {
        const schoolLayers = [
          SCHOOLS_POLYGONS_FILL_LAYER_ID,
          SCHOOLS_POLYGONS_STROKE_LAYER_ID,
          SCHOOLS_POLYGONS_HOVER_LAYER_ID,
        ];

        console.log("🔄 Moving school layers to top...");

        // Находим все слои
        const layers = mapInstance.getStyle().layers;
        console.log(
          "📋 All layers:",
          layers.map((l) => l.id)
        );

        // Находим последний слой полигонов районов
        let lastPolygonLayerId: string | undefined;
        for (let i = layers.length - 1; i >= 0; i--) {
          const layer = layers[i];
          // Ищем слои полигонов районов (содержат "polygon" но не "school")
          if (layer.id.includes("polygon") && !layer.id.includes("school")) {
            lastPolygonLayerId = layer.id;
            console.log("🎯 Found last polygon layer:", lastPolygonLayerId);
            break;
          }
        }

        // Если не нашли слои полигонов, ищем символьные слои
        if (!lastPolygonLayerId) {
          for (const layer of layers) {
            if (layer.type === "symbol") {
              lastPolygonLayerId = layer.id;
              console.log(
                "🎯 Using symbol layer as reference:",
                lastPolygonLayerId
              );
              break;
            }
          }
        }

        // Для каждого слоя школы перемещаем его после слоев районов
        schoolLayers.forEach((layerId) => {
          if (mapInstance.getLayer(layerId)) {
            // Получаем определение текущего слоя
            const currentLayer = mapInstance.getLayer(layerId);
            if (currentLayer) {
              // Удаляем слой
              mapInstance.removeLayer(layerId);

              // Добавляем обратно в самый конец (поверх всех слоев)
              mapInstance.addLayer(currentLayer as mapboxgl.AnyLayer);
              console.log(`✅ Moved ${layerId} to top of all layers`);
            }
          }
        });

        // Проверяем итоговый порядок слоев
        const finalLayers = mapInstance.getStyle().layers;
        const relevantLayers = finalLayers.filter(
          (l) => l.id.includes("polygon") || l.id.includes("school")
        );
        console.log(
          "📋 Final layer order (polygons and schools):",
          relevantLayers.map((l) => l.id)
        );
      } catch (err) {
        console.error("❌ Error moving school layers to top:", err);
      }
    };

    // Небольшая задержка для правильной последовательности загрузки слоев
    const timeoutId = setTimeout(initializeLayers, 100); // Уменьшена задержка
    return () => clearTimeout(timeoutId);
  }, [
    activeSchools,
    mapInstance,
    isInitialized,
    getSchoolPolygonColor,
    getSchoolStrokeColor,
  ]);

  // Обработчики событий мыши
  useEffect(() => {
    if (!mapInstance || !isInitialized) return;

    const handleMouseEnter = (
      e: mapboxgl.MapMouseEvent & {
        features?: mapboxgl.MapboxGeoJSONFeature[];
      }
    ) => {
      if (!e.features || e.features.length === 0) return;

      const feature = e.features[0];
      const school = activeSchools.find((s) => s.id === feature.id);

      if (school) {
        // Изменяем курсор
        mapInstance.getCanvas().style.cursor = "pointer";

        // Устанавливаем hover состояние
        if (hoveredSchoolId.current !== null) {
          mapInstance.setFeatureState(
            { source: SCHOOLS_POLYGONS_SOURCE_ID, id: hoveredSchoolId.current },
            { hover: false }
          );
        }
        hoveredSchoolId.current = school.id;
        mapInstance.setFeatureState(
          { source: SCHOOLS_POLYGONS_SOURCE_ID, id: school.id },
          { hover: true }
        );
      }
    };

    const handleMouseLeave = () => {
      mapInstance.getCanvas().style.cursor = "";

      if (hoveredSchoolId.current !== null) {
        mapInstance.setFeatureState(
          { source: SCHOOLS_POLYGONS_SOURCE_ID, id: hoveredSchoolId.current },
          { hover: false }
        );
        hoveredSchoolId.current = null;
      }
    };

    const handleClick = (
      e: mapboxgl.MapMouseEvent & {
        features?: mapboxgl.MapboxGeoJSONFeature[];
      }
    ) => {
      if (!e.features || e.features.length === 0) return;

      // Останавливаем распространение события
      e.preventDefault();
      e.originalEvent.stopPropagation();

      const feature = e.features[0];
      const school = activeSchools.find((s) => s.id === feature.id);

      console.log("🎯 School polygon clicked:", {
        featureId: feature.id,
        schoolFound: !!school,
        schoolName: school?.properties?.name_of_the_organization || "Unknown",
        clickPosition: e.lngLat,
      });

      if (school) {
        // Удаляем существующий popup
        if (popup.current) {
          popup.current.remove();
        }

        // Создаем содержимое popup
        const popupContent = createSchoolPopupContent(school);

        // Создаем и показываем popup
        popup.current = new mapboxgl.Popup({
          closeButton: true,
          maxWidth: "400px",
          className: "school-polygon-popup",
        })
          .setLngLat(e.lngLat)
          .setHTML(popupContent)
          .addTo(mapInstance);
      }
    };

    // Добавляем обработчики событий только если слои существуют
    if (mapInstance.getLayer(SCHOOLS_POLYGONS_FILL_LAYER_ID)) {
      mapInstance.on(
        "mouseenter",
        SCHOOLS_POLYGONS_FILL_LAYER_ID,
        handleMouseEnter
      );
      mapInstance.on(
        "mouseleave",
        SCHOOLS_POLYGONS_FILL_LAYER_ID,
        handleMouseLeave
      );
      mapInstance.on("click", SCHOOLS_POLYGONS_FILL_LAYER_ID, handleClick);
    }

    // Cleanup function только для обработчиков событий
    return () => {
      if (popup.current) {
        popup.current.remove();
        popup.current = null;
      }

      if (mapInstance.getLayer(SCHOOLS_POLYGONS_FILL_LAYER_ID)) {
        mapInstance.off(
          "mouseenter",
          SCHOOLS_POLYGONS_FILL_LAYER_ID,
          handleMouseEnter
        );
        mapInstance.off(
          "mouseleave",
          SCHOOLS_POLYGONS_FILL_LAYER_ID,
          handleMouseLeave
        );
        mapInstance.off("click", SCHOOLS_POLYGONS_FILL_LAYER_ID, handleClick);
      }
    };
  }, [mapInstance, isInitialized, activeSchools]);

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      if (!mapInstance) return;

      // Удаляем слои только при размонтировании компонента
      [
        SCHOOLS_POLYGONS_HOVER_LAYER_ID,
        SCHOOLS_POLYGONS_STROKE_LAYER_ID,
        SCHOOLS_POLYGONS_FILL_LAYER_ID,
      ].forEach((layerId) => {
        if (mapInstance.getLayer(layerId)) {
          mapInstance.removeLayer(layerId);
        }
      });

      // Удаляем источник данных
      if (mapInstance.getSource(SCHOOLS_POLYGONS_SOURCE_ID)) {
        mapInstance.removeSource(SCHOOLS_POLYGONS_SOURCE_ID);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Пустой массив зависимостей - выполнится только при размонтировании

  // Компонент не рендерит ничего
  return null;
}
