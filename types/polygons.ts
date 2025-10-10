import type { Feature, FeatureCollection, Polygon } from "geojson";

/** Свойства полигона из API schools_enriched */
export interface PolygonProperties {
  polygon_id: number;
  year: number;
  geom_text: string;
  bilingual: string;
  kazakh: string;
  russian: string;
  uyghur: string;
  demand_public_6_17: number;
  capacity_with_shifts_weighted: number;
  deficit: number;
  surplus: number;
  status: "surplus" | "deficit";
}

/** GeoJSON Feature для полигона */
export type PolygonFeature = Feature<Polygon, PolygonProperties>;

/** Коллекция полигонов */
export type PolygonFeatureCollection = FeatureCollection<
  Polygon,
  PolygonProperties
>;

/** Ответ API для полигонов */
export interface PolygonsApiResponse {
  type: "FeatureCollection";
  name: string;
  crs: {
    type: "name";
    properties: {
      name: string;
    };
  };
  count: number;
  next: string | null;
  previous: string | null;
  features: PolygonFeature[];
}

/** Фильтры для полигонов */
export interface PolygonFilters {
  year?: number;
  status?: "surplus" | "deficit" | "all";
  minCapacity?: number;
  maxCapacity?: number;
  minDemand?: number;
  maxDemand?: number;
}

/** Конфигурация стилей для полигонов */
export interface PolygonStyleConfig {
  surplusColor: string;
  deficitColor: string;
  opacity: number;
  strokeColor: string;
  strokeWidth: number;
  highlightColor: string;
}
