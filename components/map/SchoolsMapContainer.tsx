"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { SchoolFeature } from "@/types/schools-map";
import { SchoolsMapService } from "@/services/schools-map.service";

// Set Mapbox token from environment variable
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

// Almaty, Kazakhstan coordinates
const ALMATY_CENTER: [number, number] = [76.9286, 43.2567];
const DEFAULT_ZOOM = 11;

interface SchoolsMapContainerProps {
  schools: SchoolFeature[];
  selectedSchool: SchoolFeature | null;
  onSchoolSelect: (school: SchoolFeature | null) => void;
}

export default function SchoolsMapContainer({
  schools,
  selectedSchool,
  onSchoolSelect,
}: SchoolsMapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInitError, setMapInitError] = useState<string | null>(null);

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
      console.log("Initializing Mapbox map for schools");

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: ALMATY_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
      });

      // Add attribution control in bottom-right corner
      map.current.addControl(
        new mapboxgl.AttributionControl({
          compact: true,
        }),
        "bottom-right"
      );

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on("load", () => {
        console.log("Schools map loaded successfully");
        setMapLoaded(true);
      });

      map.current.on("error", (e) => {
        console.error("Mapbox error:", e);
        setMapInitError("Failed to load the map. Please try again.");
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapInitError(
        "Failed to initialize the map. Please check your internet connection and try again."
      );
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  };

  // Create school popup content
  const createSchoolPopup = (school: SchoolFeature): string => {
    const data = SchoolsMapService.formatSchoolData(school);

    return `
      <div class="school-popup-enhanced max-w-md">
        <!-- Header with close button -->
        <div class="popup-header relative bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-t-lg border-b border-gray-200">
          <div class="pr-6">
            <h3 class="font-bold text-lg text-gray-900 leading-tight mb-1">${
              data.name
            }</h3>
            ${
              data.note
                ? `<p class="text-sm text-gray-600 italic">${data.note}</p>`
                : ""
            }
          </div>
          <!-- Rating badge in top right -->
          ${
            data.rating
              ? `
            <div class="absolute top-3 right-3">
              <div class="flex items-center bg-white rounded-full px-2 py-1 shadow-sm border">
                <svg class="w-4 h-4 ${
                  data.rating >= 4.5
                    ? "text-green-500"
                    : data.rating >= 4.0
                    ? "text-yellow-500"
                    : "text-red-500"
                } mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span class="text-sm font-semibold ${
                  data.rating >= 4.5
                    ? "text-green-700"
                    : data.rating >= 4.0
                    ? "text-yellow-700"
                    : "text-red-700"
                }">${data.rating.toFixed(1)}</span>
              </div>
            </div>
          `
              : ""
          }
        </div>
        
        <div class="popup-content p-4 space-y-3 text-sm bg-white">
          <!-- School type and ownership -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              ${
                data.educationType
                  ? `<span class="text-gray-700 font-medium">${data.educationType}</span>`
                  : ""
              }
              <span class="px-2 py-1 text-xs font-medium rounded-full ${
                data.isPrivate
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
              }">
                ${data.isPrivate ? "Частная" : "Государственная"}
              </span>
            </div>
          </div>

          <!-- Location info -->
          ${
            data.address || data.district
              ? `
            <div class="border border-gray-100 rounded-lg p-3 bg-gray-50">
              <div class="flex items-start space-x-2">
                <svg class="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <div class="flex-1 min-w-0">
                  ${
                    data.district
                      ? `<div class="text-sm font-medium text-gray-900">${data.district}</div>`
                      : ""
                  }
                  ${
                    data.address
                      ? `<div class="text-xs text-gray-600 break-words">${data.address}</div>`
                      : ""
                  }
                </div>
              </div>
            </div>
          `
              : ""
          }
          
          <!-- Capacity and load status -->
          ${
            data.capacity || data.actualStudents
              ? `
            <div class="border border-gray-100 rounded-lg p-3 bg-gray-50">
              <div class="flex items-center space-x-2 mb-2">
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <span class="text-sm font-medium text-gray-900">Загруженность</span>
              </div>
              
              <div class="grid grid-cols-2 gap-3 mb-2">
                ${
                  data.capacity
                    ? `
                  <div class="text-center">
                    <div class="text-lg font-bold text-gray-900">${data.capacity}</div>
                    <div class="text-xs text-gray-500">Вместимость</div>
                  </div>
                `
                    : ""
                }
                ${
                  data.actualStudents
                    ? `
                  <div class="text-center">
                    <div class="text-lg font-bold text-gray-900">${data.actualStudents}</div>
                    <div class="text-xs text-gray-500">Учащихся</div>
                  </div>
                `
                    : ""
                }
              </div>
              
              ${
                data.overloadStatus
                  ? `
                <div class="flex justify-center">
                  <span class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                    data.overloadStatus === "overloaded"
                      ? "bg-red-100 text-red-800"
                      : data.overloadStatus === "underloaded"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }">
                    <span class="w-2 h-2 rounded-full mr-2 ${
                      data.overloadStatus === "overloaded"
                        ? "bg-red-400"
                        : data.overloadStatus === "underloaded"
                        ? "bg-yellow-400"
                        : "bg-green-400"
                    }"></span>
                    ${
                      data.overloadStatus === "overloaded"
                        ? "Перегружена"
                        : data.overloadStatus === "underloaded"
                        ? "Недозагружена"
                        : "Сбалансирована"
                    }
                  </span>
                </div>
              `
                  : ""
              }
              
              ${
                data.capacity && data.actualStudents
                  ? `
                <div class="mt-3 bg-white rounded-md p-2">
                  <div class="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Заполненность</span>
                    <span>${Math.round(
                      (data.actualStudents / data.capacity) * 100
                    )}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full ${
                      data.actualStudents / data.capacity > 1
                        ? "bg-red-500"
                        : data.actualStudents / data.capacity > 0.9
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }" style="width: ${Math.min(
                      (data.actualStudents / data.capacity) * 100,
                      100
                    )}%"></div>
                  </div>
                </div>
              `
                  : ""
              }
            </div>
          `
              : ""
          }

          <!-- Footer with action button -->
          <div class="pt-2 border-t border-gray-100">
            <button class="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Подробнее о школе</span>
            </button>
          </div>
        </div>
      </div>
    `;
  };

  // Add schools markers to map
  useEffect(() => {
    if (!map.current || !mapLoaded || !schools.length) return;

    clearMarkers();

    console.log(`Adding ${schools.length} schools to map`);

    // Добавим тестовый маркер в центр Алматы для проверки
    const testElement = document.createElement("div");
    testElement.style.cssText = `
      width: 20px;
      height: 20px;
      background-color: red;
      border: 3px solid yellow;
      border-radius: 50%;
      cursor: pointer;
    `;

    const testMarker = new mapboxgl.Marker({
      element: testElement,
      anchor: "center",
    })
      .setLngLat([76.9286, 43.2567]) // Центр Алматы
      .addTo(map.current!);

    markersRef.current.push(testMarker);
    console.log("Added test marker at Almaty center:", [76.9286, 43.2567]);

    schools.forEach((school, index) => {
      const [lng, lat] = school.geometry.coordinates;
      const props = school.properties;

      // Валидация координат для Алматы
      // Примерные границы Алматы: lng: 76.7-77.2, lat: 43.1-43.4
      if (lng < 76 || lng > 78 || lat < 42 || lat > 44) {
        console.warn(
          `Invalid coordinates for school ${props.organization_name}:`,
          [lng, lat]
        );
        return; // Пропускаем школы с невалидными координатами
      }

      if (index < 3) {
        // Log first 3 schools with validation
        console.log(`School ${index}:`, {
          name: props.organization_name,
          coordinates: [lng, lat],
          district: props.district,
          valid: true,
        });
      }

      // Используем стандартный маркер Mapbox вместо создания custom HTML элемента
      const marker = new mapboxgl.Marker({
        color: props.circle_color || "#3b82f6",
        scale: 0.8,
      })
        .setLngLat([lng, lat])
        .addTo(map.current!);

      // Создаем popup для маркера
      const popupContent = createSchoolPopup(school);
      const popup = new mapboxgl.Popup({
        offset: 20,
        closeButton: true,
        closeOnClick: false,
        maxWidth: "420px",
        className: "school-popup-enhanced",
      }).setHTML(popupContent);

      marker.setPopup(popup);

      // Добавляем события для выбора школы
      marker.getElement().addEventListener("click", () => {
        onSchoolSelect(school);

        popup.on("close", () => {
          onSchoolSelect(null);
        });
      });

      markersRef.current.push(marker);
    });
  }, [schools, mapLoaded, onSchoolSelect]);

  // Handle selected school
  useEffect(() => {
    if (!map.current || !selectedSchool) return;

    const [lng, lat] = selectedSchool.geometry.coordinates;

    // Fly to selected school
    map.current.flyTo({
      center: [lng, lat],
      zoom: Math.max(DEFAULT_ZOOM + 2, map.current.getZoom()),
      duration: 1000,
    });
  }, [selectedSchool]);

  if (mapInitError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-red-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
          <h3 className="font-bold text-red-600 mb-2">Ошибка загрузки карты</h3>
          <p className="text-gray-700">{mapInitError}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={mapContainer} className="h-full w-full" />
      <style jsx>{`
        .school-popup .mapboxgl-popup-content {
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .school-popup .mapboxgl-popup-tip {
          border-top-color: white;
        }

        /* Enhanced popup styles */
        :global(.school-popup-enhanced .mapboxgl-popup-content) {
          padding: 0 !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid #e5e7eb !important;
          max-width: 420px !important;
          font-family: system-ui, -apple-system, sans-serif !important;
        }

        :global(.school-popup-enhanced .mapboxgl-popup-tip) {
          border-top-color: white !important;
          border-width: 8px !important;
        }

        :global(.school-popup-enhanced .mapboxgl-popup-close-button) {
          background: rgba(255, 255, 255, 0.9) !important;
          border-radius: 50% !important;
          width: 32px !important;
          height: 32px !important;
          font-size: 18px !important;
          font-weight: bold !important;
          color: #374151 !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          top: 12px !important;
          right: 12px !important;
          z-index: 10 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }

        :global(.school-popup-enhanced .mapboxgl-popup-close-button:hover) {
          background: white !important;
          transform: scale(1.1) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        :global(.school-tooltip .mapboxgl-popup-content) {
          padding: 8px;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          background: white;
          border: 1px solid #e5e7eb;
          max-width: 250px !important;
        }

        :global(.school-tooltip .mapboxgl-popup-tip) {
          border-top-color: white;
          border-width: 5px;
        }

        :global(.school-popup-detailed .mapboxgl-popup-content) {
          padding: 16px;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          max-width: 400px !important;
        }

        :global(.school-popup-detailed .mapboxgl-popup-tip) {
          border-top-color: white;
        }
      `}</style>
    </>
  );
}
