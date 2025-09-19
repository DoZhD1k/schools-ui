export interface DashboardStats {
  totalSchools: number;
  leadingSchools: number;
  totalStudents: number;
  averageRating: number;
  totalTeachers: number;
  totalCollections: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export class DashboardService {
  /**
   * Fetch dashboard statistics
   */
  static async getDashboardStats(accessToken: string): Promise<DashboardStats> {
    try {
      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/dashboard", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        // Если API недоступно, возвращаем моковые данные
        return {
          totalSchools: 1247,
          leadingSchools: 89,
          totalStudents: 45632,
          averageRating: 4.2,
          totalTeachers: 3891,
          totalCollections: 12,
          recentActivity: [
            {
              id: "1",
              type: "school_added",
              description: "Добавлена новая школа № 25",
              timestamp: new Date(
                Date.now() - 2 * 60 * 60 * 1000
              ).toISOString(),
            },
            {
              id: "2",
              type: "rating_updated",
              description: "Обновлен рейтинг для 15 школ",
              timestamp: new Date(
                Date.now() - 5 * 60 * 60 * 1000
              ).toISOString(),
            },
            {
              id: "3",
              type: "collection_uploaded",
              description: "Загружена новая коллекция данных",
              timestamp: new Date(
                Date.now() - 24 * 60 * 60 * 1000
              ).toISOString(),
            },
          ],
        };
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      // Возвращаем моковые данные в случае ошибки
      return {
        totalSchools: 1247,
        leadingSchools: 89,
        totalStudents: 45632,
        averageRating: 4.2,
        totalTeachers: 3891,
        totalCollections: 12,
        recentActivity: [
          {
            id: "1",
            type: "school_added",
            description: "Добавлена новая школа № 25",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "2",
            type: "rating_updated",
            description: "Обновлен рейтинг для 15 школ",
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "3",
            type: "collection_uploaded",
            description: "Загружена новая коллекция данных",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      };
    }
  }
}
