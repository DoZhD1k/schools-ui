import type {
  PolygonsApiResponse,
  PolygonFeature,
  PolygonFilters,
} from "@/types/polygons";

export class PolygonsService {
  /**
   * Получить полигоны с сервера
   */
  static async getPolygons(
    filters?: PolygonFilters,
    limit = 50,
    offset = 0
  ): Promise<PolygonsApiResponse> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (filters?.year) {
        params.append("year", filters.year.toString());
      }
      if (filters?.status && filters.status !== "all") {
        params.append("status", filters.status);
      }

      // Используем наш API роут для обхода CORS
      const url = `/api/v1/institutions-monitoring/balance-enriched?${params.toString()}`;
      console.log("Fetching polygons from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Polygons API response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching polygons:", error);
      throw new Error("Не удалось загрузить данные полигонов");
    }
  }

  /**
   * Получить все полигоны
   */
  static async getAllPolygons(
    filters?: PolygonFilters
  ): Promise<PolygonFeature[]> {
    try {
      const response = await this.getPolygons(filters, 2000, 0);
      return response.features;
    } catch (error) {
      console.error("Error fetching all polygons:", error);
      throw error;
    }
  }

  /**
   * Получить статистику по полигонам
   */
  static getPolygonsStatistics(polygons: PolygonFeature[]) {
    const stats = {
      total: polygons.length,
      surplus: 0,
      deficit: 0,
      totalCapacity: 0,
      totalDemand: 0,
      totalSurplus: 0,
      totalDeficit: 0,
      years: new Set<number>(),
    };

    polygons.forEach((polygon) => {
      const props = polygon.properties;

      if (props.status === "surplus") {
        stats.surplus++;
        stats.totalSurplus += props.surplus;
      } else if (props.status === "deficit") {
        stats.deficit++;
        stats.totalDeficit += props.deficit;
      }

      stats.totalCapacity += props.capacity_with_shifts_weighted;
      stats.totalDemand += props.demand_public_6_17;
      stats.years.add(props.year);
    });

    return {
      ...stats,
      years: Array.from(stats.years).sort(),
      averageCapacity: stats.totalCapacity / stats.total || 0,
      averageDemand: stats.totalDemand / stats.total || 0,
    };
  }

  /**
   * Форматирование данных полигона для отображения
   */
  static formatPolygonData(polygon: PolygonFeature) {
    const props = polygon.properties;

    return {
      id: props.polygon_id,
      year: props.year,
      status: props.status,
      statusText: props.status === "surplus" ? "Избыток мест" : "Дефицит мест",
      capacity: Math.round(props.capacity_with_shifts_weighted),
      demand: Math.round(props.demand_public_6_17),
      surplus: Math.round(props.surplus),
      deficit: Math.round(props.deficit),
      balanceValue: props.status === "surplus" ? props.surplus : props.deficit,
      languages: {
        kazakh: props.kazakh || "Нет данных",
        russian: props.russian || "Нет данных",
        bilingual: props.bilingual || "Нет данных",
        uyghur: props.uyghur || "Нет данных",
      },
      loadPercent: Math.round(
        (props.demand_public_6_17 / props.capacity_with_shifts_weighted) * 100
      ),
    };
  }
}
