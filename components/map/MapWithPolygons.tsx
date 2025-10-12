"use client";

import React from "react";
import MapContainer from "./MapContainer";
import { useMapContext } from "@/contexts/map-context";
import type { SchoolFeature, DistrictPolygon } from "@/types/schools-map";

interface MapWithPolygonsProps {
  className?: string;
  // Schools data props
  schools?: SchoolFeature[];
  selectedSchool?: SchoolFeature | null;
  onSchoolSelect?: (school: SchoolFeature | null) => void;
  // Map mode: 'polygons' for grid data, 'schools' for schools, 'both' for combined
  mode?: "polygons" | "schools" | "both";
  // District polygons for new filtering system
  districtPolygons?: DistrictPolygon[];
}

export default function MapWithPolygons({
  className = "",
  schools = [],
  mode = "both",
  districtPolygons = [],
}: MapWithPolygonsProps) {
  const { showPolygons, polygons } = useMapContext();

  console.log("MapWithPolygons render:", {
    mode,
    showPolygons,
    polygonsCount: polygons?.length || 0,
  });

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Render different components based on mode */}
      {mode === "polygons" && (
        <MapContainer districtPolygons={districtPolygons} schools={schools} />
      )}

      {/* Loading indicator styles */}
      <style jsx global>{`
        .polygon-popup .mapboxgl-popup-content {
          padding: 0 !important;
          border-radius: 12px !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid #e5e7eb !important;
          max-width: 350px !important;
          font-family: system-ui, -apple-system, sans-serif !important;
        }

        .polygon-popup .mapboxgl-popup-tip {
          border-top-color: white !important;
          border-width: 8px !important;
        }

        .polygon-popup .mapboxgl-popup-close-button {
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

        .polygon-popup .mapboxgl-popup-close-button:hover {
          background: white !important;
          transform: scale(1.1) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        /* Animate polygon layers */
        .mapboxgl-canvas {
          transition: opacity 0.3s ease;
        }

        /* Loading state */
        .polygons-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.95);
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .polygons-loading .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        /* Error state */
        .polygons-error {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.95);
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-left: 4px solid #ef4444;
          z-index: 1000;
          max-width: 300px;
        }

        .polygons-error h3 {
          margin: 0 0 8px 0;
          color: #dc2626;
          font-size: 16px;
          font-weight: 600;
        }

        .polygons-error p {
          margin: 0;
          color: #374151;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
