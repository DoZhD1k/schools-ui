"use client";

import { useEffect, useState, useCallback } from "react";
import { CircleMarker, Popup } from "react-leaflet";
import { SchoolsMapService } from "@/services/schools-map.service";
import { SchoolFeature } from "@/types/schools-map";
import { School } from "@/types/schools";

interface SchoolMarkersLayerProps {
  filteredSchools?: SchoolFeature[];
  onSchoolSelect?: (school: SchoolFeature) => void;
  schoolsWithRatings?: School[];
}

export default function SchoolMarkersLayer({
  filteredSchools,
  onSchoolSelect,
  schoolsWithRatings = [],
}: SchoolMarkersLayerProps) {
  const [schools, setSchools] = useState<SchoolFeature[]>([]);

  // Load schools from API when no filtered list is provided
  useEffect(() => {
    if (filteredSchools) return;

    SchoolsMapService.fetchSchools()
      .then((all: SchoolFeature[]) => {
        if (!all?.length) return;
        setSchools(
          all
            .filter((sf) => {
              const coords = sf.properties?.infra?.origin_marker?.coordinates;
              return (
                Array.isArray(coords) &&
                coords.length === 2 &&
                typeof coords[0] === "number" &&
                typeof coords[1] === "number"
              );
            })
            .map((sf) => {
              const school = sf.properties;
              return {
                type: "Feature" as const,
                id: school.id,
                geometry: {
                  type: "Point" as const,
                  coordinates: school.infra!.origin_marker.coordinates as [number, number],
                },
                properties: {
                  id: school.id,
                  name_of_the_organization: school.name_of_the_organization,
                  types_of_educational_institutions: school.types_of_educational_institutions,
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
            })
        );
      })
      .catch((err) => console.error("Error loading schools:", err));
  }, [filteredSchools]);

  const activeSchools = filteredSchools || schools;

  const getColor = useCallback(
    (school: SchoolFeature): string => {
      const withRating = schoolsWithRatings?.find(
        (s) =>
          s.id === school.id.toString() ||
          s.nameRu === school.properties.name_of_the_organization
      );

      if (withRating?.currentRating) {
        const r = withRating.currentRating;
        if (r >= 86) return "#10B981";
        if (r >= 50) return "#F59E0B";
        if (r >= 5) return "#EF4444";
      }

      const gis = school.properties.gis_rating;
      if (gis) {
        if (gis >= 4.0) return "#10B981";
        if (gis >= 3.0) return "#F59E0B";
        return "#EF4444";
      }

      if (school.properties.form_of_ownership?.includes("граждан")) return "#F97316";
      return "#6366F1";
    },
    [schoolsWithRatings]
  );

  const getRadius = useCallback((school: SchoolFeature): number => {
    const c = school.properties.contingency_filter;
    if (c) {
      if (c >= 1000) return 12;
      if (c >= 500) return 10;
      if (c >= 200) return 8;
      return 6;
    }
    return 8;
  }, []);

  return (
    <>
      {activeSchools
        .filter((school) => {
          const coords = school.properties?.infra?.origin_marker?.coordinates;
          return Array.isArray(coords) && coords.length === 2;
        })
        .map((school) => {
          const [lng, lat] = school.properties.infra!.origin_marker
            .coordinates as [number, number];
          return (
            <CircleMarker
              key={school.id}
              center={[lat, lng]}
              radius={getRadius(school)}
              pathOptions={{
                fillColor: getColor(school),
                color: "#ffffff",
                weight: 2,
                fillOpacity: 0.8,
              }}
              eventHandlers={{
                click: () => onSchoolSelect?.(school),
              }}
            >
              <Popup>
                <div style={{ padding: "4px 8px", fontSize: "14px", fontWeight: 500 }}>
                  {school.properties.name_of_the_organization}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
    </>
  );
}
