"use client";

import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

interface LayerOrderTestProps {
  mapInstance: mapboxgl.Map;
}

export default function LayerOrderTest({ mapInstance }: LayerOrderTestProps) {
  const [layerOrder, setLayerOrder] = useState<string[]>([]);

  useEffect(() => {
    if (!mapInstance) return;

    const checkLayerOrder = () => {
      const style = mapInstance.getStyle();
      if (style && style.layers) {
        const customLayers = style.layers
          .filter(
            (layer) =>
              layer.id.includes("school") ||
              layer.id.includes("polygon") ||
              layer.id.includes("area-")
          )
          .map((layer) => layer.id);

        setLayerOrder(customLayers);

        // Check if schools are after polygons
        const schoolIndex = customLayers.findIndex((id) =>
          id.includes("school")
        );
        const polygonIndex = customLayers.findIndex((id) =>
          id.includes("polygon")
        );

        if (schoolIndex !== -1 && polygonIndex !== -1) {
          if (schoolIndex > polygonIndex) {
            console.log(
              "✅ Layer order is correct: schools are above polygons"
            );
          } else {
            console.warn(
              "⚠️ Layer order issue: schools might be below polygons"
            );
          }
        }
      }
    };

    // Check immediately
    checkLayerOrder();

    // Check when style changes
    mapInstance.on("styledata", checkLayerOrder);
    mapInstance.on("sourcedata", checkLayerOrder);

    return () => {
      mapInstance.off("styledata", checkLayerOrder);
      mapInstance.off("sourcedata", checkLayerOrder);
    };
  }, [mapInstance]);

  if (layerOrder.length === 0) return null;

  return;
}
