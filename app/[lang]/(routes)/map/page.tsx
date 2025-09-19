"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import MapControls from "@/components/map/MapControls";
import MapLoading from "@/components/map/MapLoading";

// Dynamically import the MapContainer to avoid SSR issues with mapbox-gl
const MapContainer = dynamic(() => import("@/components/map/MapContainer"), {
  ssr: false,
  loading: () => <MapLoading />,
});

export default function MapPage() {
  const [error] = useState<string | null>(null);

  return (
    <div className="relative h-[100vh] w-full overflow-hidden">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white p-4 rounded shadow-lg">
            <h3 className="font-bold text-red-500">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <>
          <MapContainer />
          <MapControls />
        </>
      )}
    </div>
  );
}
