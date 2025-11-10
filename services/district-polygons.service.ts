import type { DistrictPolygon } from "@/types/schools-map";
import { api } from "@/lib/axios";

const BALANCE_ENRICHED_API_URL =
  "https://admin.smartalmaty.kz/api/v1/institutions-monitoring/balance-enriched/";

export interface BalanceEnrichedApiResponse {
  type: "FeatureCollection";
  name: string;
  count: number;
  crs: {
    type: "name";
    properties: {
      name: string;
    };
  };
  features: DistrictPolygon[];
}

export class DistrictPolygonsService {
  /**
   * Загружает данные о полигонах районов с API
   */
  static async fetchDistrictPolygons(): Promise<DistrictPolygon[]> {
    try {
      console.log(
        "🏘️ Fetching district polygons from:",
        BALANCE_ENRICHED_API_URL
      );

      const response = await api.get<BalanceEnrichedApiResponse>(
        BALANCE_ENRICHED_API_URL,
        {
          params: { limit: 2500 },
        }
      );

      console.log("📥 Response status: 200");
      console.log("📊 Received polygon data:", {
        type: response.data.type,
        count: response.data.count,
        features: response.data.features.length,
        name: response.data.name,
      });

      // Логируем первый полигон для отладки
      if (response.data.features.length > 0) {
        const firstPolygon = response.data.features[0];
        console.log("🔍 First polygon sample:", {
          id: firstPolygon.id,
          type: firstPolygon.type,
          geometryType: firstPolygon.geometry?.type,
          properties: firstPolygon.properties,
        });
      }

      return response.data.features;
    } catch (error) {
      console.error("❌ Error fetching district polygons:", error);
      throw error;
    }
  }

  /**
   * Фильтрует полигоны по статусу
   */
  static filterByStatus(
    polygons: DistrictPolygon[],
    status: "all" | "surplus" | "deficit"
  ): DistrictPolygon[] {
    if (status === "all") {
      return polygons;
    }

    return polygons.filter((polygon) => polygon.properties?.status === status);
  }

  /**
   * Фильтрует полигоны по году
   */
  static filterByYear(
    polygons: DistrictPolygon[],
    year?: number
  ): DistrictPolygon[] {
    if (!year) {
      return polygons;
    }

    return polygons.filter((polygon) => polygon.properties?.year === year);
  }

  /**
   * Фильтрует полигоны по диапазону вместимости
   */
  static filterByCapacity(
    polygons: DistrictPolygon[],
    minCapacity?: number,
    maxCapacity?: number
  ): DistrictPolygon[] {
    return polygons.filter((polygon) => {
      const capacity = polygon.properties?.capacity_with_shifts_weighted || 0;

      if (minCapacity !== undefined && capacity < minCapacity) {
        return false;
      }

      if (maxCapacity !== undefined && capacity > maxCapacity) {
        return false;
      }

      return true;
    });
  }

  /**
   * Фильтрует полигоны по диапазону потребности
   */
  static filterByDemand(
    polygons: DistrictPolygon[],
    minDemand?: number,
    maxDemand?: number
  ): DistrictPolygon[] {
    return polygons.filter((polygon) => {
      const demand = polygon.properties?.demand_public_6_17 || 0;

      if (minDemand !== undefined && demand < minDemand) {
        return false;
      }

      if (maxDemand !== undefined && demand > maxDemand) {
        return false;
      }

      return true;
    });
  }
}
