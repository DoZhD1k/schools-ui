"use client";

import dynamic from "next/dynamic";
import { MapProvider } from "@/contexts/map-context";
import MapLoading from "@/components/map/MapLoading";

// Dynamically import the MapWithPolygons to avoid SSR issues with mapbox-gl
const MapWithPolygons = dynamic(
  () => import("@/components/map/MapWithPolygons"),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

export default function PolygonsTestPage() {
  return (
    <MapProvider>
      <div className="h-[100vh] w-full">
        <MapWithPolygons mode="polygons" />
      </div>
    </MapProvider>
  );
}
