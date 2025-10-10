"use client";

import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { SchoolsMapService } from "@/services/schools-map.service";

interface SchoolPolygonsDebugProps {
  mapInstance: mapboxgl.Map;
}

export default function SchoolPolygonsDebug({
  mapInstance,
}: SchoolPolygonsDebugProps) {
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const debugSchools = async () => {
      try {
        const schools = await SchoolsMapService.fetchSchools();
        console.log("🔍 Total schools loaded:", schools.length);

        const polygonSchools = schools.filter(
          (s) => s.geometry.type === "MultiPolygon"
        );
        console.log("🔍 Schools with MultiPolygon:", polygonSchools.length);

        if (polygonSchools.length > 0) {
          const firstSchool = polygonSchools[0];
          const coords = firstSchool.geometry.coordinates as [
            number,
            number
          ][][][];

          console.log("🔍 First school with polygon:", {
            id: firstSchool.id,
            name: firstSchool.properties.name_of_the_organization,
            geometryType: firstSchool.geometry.type,
            multiPolygonCount: coords.length,
            firstPolygonRingsCount: coords[0]?.length,
            firstRingPointsCount: coords[0]?.[0]?.length,
            firstFivePoints: coords[0]?.[0]?.slice(0, 5),
            rawCoordinates: coords,
          });

          // Проверим структуру данных
          console.log("🔍 Coordinate structure check:");
          console.log("- Is array?", Array.isArray(coords));
          console.log("- First polygon is array?", Array.isArray(coords[0]));
          console.log(
            "- First ring is array?",
            Array.isArray(coords[0]?.[0])
          );
          console.log(
            "- First point is array?",
            Array.isArray(coords[0]?.[0]?.[0])
          );
          console.log("- First point:", coords[0]?.[0]?.[0]);

          // Проверим, возможно координаты перевернуты (lat, lon вместо lon, lat)
          const firstPoint = coords[0]?.[0]?.[0];
          if (firstPoint) {
            console.log("🔍 Coordinate order check:");
            console.log("- Point:", firstPoint);
            console.log("- [0] (should be longitude -180 to 180):", firstPoint[0]);
            console.log("- [1] (should be latitude -90 to 90):", firstPoint[1]);

            // Если первое значение в диапазоне широты, а не долготы - нужен swap
            if (Math.abs(firstPoint[0]) <= 90 && Math.abs(firstPoint[1]) > 90) {
              console.warn("⚠️ Coordinates might be in [lat, lon] format instead of [lon, lat]!");
            }
          }

          setDebugInfo(
            `Found ${polygonSchools.length} schools with polygons\n` +
              `First school: ${firstSchool.properties.name_of_the_organization}\n` +
              `Polygons: ${coords.length}\n` +
              `Rings in first polygon: ${coords[0]?.length}\n` +
              `Points in first ring: ${coords[0]?.[0]?.length}\n` +
              `First point: ${JSON.stringify(coords[0]?.[0]?.[0])}`
          );
        } else {
          setDebugInfo("No schools with polygons found");
        }
      } catch (err) {
        console.error("Debug error:", err);
        setDebugInfo(`Error: ${err}`);
      }
    };

    debugSchools();
  }, [mapInstance]);

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        background: "white",
        padding: 10,
        borderRadius: 5,
        maxWidth: 400,
        fontSize: 12,
        whiteSpace: "pre-wrap",
        zIndex: 1000,
      }}
    >
      <strong>Debug Info:</strong>
      <pre>{debugInfo}</pre>
    </div>
  );
}
