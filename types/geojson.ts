// types.ts
import type { Feature, FeatureCollection, MultiPolygon } from "geojson";

/** Все свойства “сетки” после обогащения метриками */
export interface EnrichedGridProperties {
  name: string;
  nameRu: string;
  area_m2: number;
  grid_id: number;
  area_km2: number;
  population: number;
  crimes_count: number;
  cameras_count: number;
  company_count: number;
  crimes_per_camera: number | null;
  crimes_per_company: number | null;
  people_per_company: number | null;
  cameras_per_company: number | null;
  camera_density_per_km2: number;
  crimes_density_per_km2: number;
  crimes_per_1000_people: number;
  density_people_per_km2: number;
  cameras_per_1000_people: number;
  company_density_per_km2: number;
  companies_per_1000_people: number;
}

/** GeoJSON-фича с MultiPolygon и нашим набором свойств */
export type EnrichedGridFeature = Feature<MultiPolygon, EnrichedGridProperties>;

/** Коллекция таких фич */
export type EnrichedGridFeatureCollection = FeatureCollection<
  MultiPolygon,
  EnrichedGridProperties
>;

/** “Сырой” объект из нового эндпойнта */
export interface RawEnrichedGridItem {
  id: number;
  type: string;
  properties: EnrichedGridProperties & { geometry?: null };
  geometry: MultiPolygon;
  collection_id: number;
  created_at: string;
  updated_at: string;
}
