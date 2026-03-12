"use client";

import React from "react";
import MapContainer from "./MapContainer";
import { useMapContext } from "@/contexts/map-context";
import type { SchoolFeature, DistrictPolygon } from "@/types/schools-map";
import type { School } from "@/types/schools";

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
  // Schools with ratings for proper color coding
  schoolsWithRatings?: School[];
}

export default function MapWithPolygons({
  className = "",
  schools = [],
  selectedSchool,
  onSchoolSelect,
  mode = "both",
  districtPolygons = [],
  schoolsWithRatings = [],
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
        <MapContainer
          districtPolygons={districtPolygons}
          schools={schools}
          selectedSchool={selectedSchool}
          onSchoolSelect={onSchoolSelect}
          schoolsWithRatings={schoolsWithRatings}
        />
      )}

    </div>
  );
}
