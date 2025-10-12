import type { DistrictPolygon } from "@/types/schools-map";

const BALANCE_ENRICHED_API_URL =
  "https://admin.smartalmaty.kz/api/v1/institutions-monitoring/balance-enriched/?limit=2500";

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

      const response = await fetch(BALANCE_ENRICHED_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BalanceEnrichedApiResponse = await response.json();
      console.log("📊 Received polygon data:", {
        type: data.type,
        count: data.count,
        features: data.features.length,
        name: data.name,
      });

      // Логируем первый полигон для отладки
      if (data.features.length > 0) {
        const firstPolygon = data.features[0];
        console.log("🔍 First polygon sample:", {
          id: firstPolygon.id,
          type: firstPolygon.type,
          geometryType: firstPolygon.geometry?.type,
          properties: firstPolygon.properties,
        });
      }

      return data.features;
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
