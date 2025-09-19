// filepath: f:\Projects\datapolis\components\map\map-component.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import Map, {
  Source,
  Layer,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  Popup,
} from "react-map-gl";
import mapboxgl from "mapbox-gl";
import type { ViewState } from "react-map-gl";
import type { Feature, FeatureCollection, GeoJsonProperties } from "geojson";
import { cn } from "@/lib/utils";
import "mapbox-gl/dist/mapbox-gl.css";

// Map styles
const DEFAULT_MAP_STYLE = "mapbox://styles/mapbox/light-v11";

// TypeScript type definitions
type MapRef = React.RefObject<mapboxgl.Map>;
type MapLayerMouseEvent = mapboxgl.MapLayerMouseEvent;
