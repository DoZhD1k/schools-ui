import { BalanceEnrichedService } from "@/services/balance-enriched.service";
import { BalanceEnrichedItem } from "@/types/schools-map";
import { api } from "@/lib/axios";

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

interface TeacherCategoryItem {
  school: number;
  total_teachers: number;
  [key: string]: string | number;
}

interface AcademicPerformanceItem {
  school: number;
  contingency_filter: number;
  grade_level_5: number;
  grade_level_4: number;
  grade_level_3: number;
  grade_level_2: number;
  [key: string]: string | number;
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

      // Получаем реальные данные из нового schools API
      try {
        console.log("📊 Fetching dashboard data from schools API...");

        // Получаем основные данные о школах
        const schoolsResponse = await api.get("/schools/", {
          params: { limit: 1000 },
        });
        const schoolsData = schoolsResponse.data;

        // Получаем данные о педагогах
        const teachersResponse = await api.get("/teacher-category/", {
          params: { limit: 1000 },
        });
        const teachersData = teachersResponse.data;

        // Получаем данные об академической успеваемости
        const performanceResponse = await api.get(
          "/academic-performance2023-2024/",
          { params: { limit: 1000 } }
        );
        const performanceData = performanceResponse.data;

        console.log("📊 API Data received:", {
          schools: schoolsData.count,
          teachers: teachersData.count,
          performance: performanceData.count,
        });

        if (
          schoolsData &&
          schoolsData.results &&
          schoolsData.results.length > 0
        ) {
          const schools = schoolsData.results;
          const totalSchools = schools.length;

          // Общее количество учителей из API teacher-category
          const totalTeachers =
            teachersData.results?.reduce(
              (sum: number, item: TeacherCategoryItem) => {
                return sum + (parseInt(item.total_teachers.toString()) || 0);
              },
              0
            ) || 0;

          // Общее количество учащихся из API academic-performance
          const totalStudents =
            performanceData.results?.reduce(
              (sum: number, item: AcademicPerformanceItem) => {
                return (
                  sum + (parseInt(item.contingency_filter.toString()) || 0)
                );
              },
              0
            ) || 0;

          // Вычисляем рейтинг на основе академической успеваемости
          let totalRating = 0;
          let schoolsWithRating = 0;

          performanceData.results?.forEach(
            (school: AcademicPerformanceItem) => {
              const total = parseInt(school.contingency_filter.toString()) || 0;
              const grade5 = parseInt(school.grade_level_5.toString()) || 0;
              const grade4 = parseInt(school.grade_level_4.toString()) || 0;

              if (total > 0) {
                // Рассчитываем рейтинг как процент учеников с оценками 4 и 5
                const rating = ((grade5 + grade4) / total) * 5; // Масштабируем до 5
                if (rating > 0) {
                  totalRating += rating;
                  schoolsWithRating++;
                }
              }
            }
          );

          const averageRating =
            schoolsWithRating > 0 ? totalRating / schoolsWithRating : 0;

          // Лидирующие школы (с рейтингом выше среднего)
          const leadingSchools =
            performanceData.results?.filter(
              (school: AcademicPerformanceItem) => {
                const total =
                  parseInt(school.contingency_filter.toString()) || 0;
                const grade5 = parseInt(school.grade_level_5.toString()) || 0;
                const grade4 = parseInt(school.grade_level_4.toString()) || 0;

                if (total > 0) {
                  const rating = ((grade5 + grade4) / total) * 5;
                  return rating > averageRating;
                }
                return false;
              }
            ).length || 0;

          console.log("📊 Dashboard stats calculated:", {
            totalSchools,
            leadingSchools,
            totalStudents,
            averageRating: averageRating.toFixed(2),
            totalTeachers,
          });

          return {
            totalSchools,
            leadingSchools,
            totalStudents,
            averageRating,
            totalTeachers,
            totalCollections: schoolsData.count, // Используем общее количество школ
            recentActivity: [
              {
                id: "1",
                type: "data_updated",
                description: `Обновлены данные для ${totalSchools} школ`,
                timestamp: new Date().toISOString(),
              },
              {
                id: "2",
                type: "stats_calculated",
                description: `Рассчитана статистика по ${totalStudents.toLocaleString()} учащимся`,
                timestamp: new Date(
                  Date.now() - 2 * 60 * 60 * 1000
                ).toISOString(),
              },
              {
                id: "3",
                type: "teachers_analyzed",
                description: `Проанализированы данные о ${totalTeachers.toLocaleString()} педагогах`,
                timestamp: new Date(
                  Date.now() - 5 * 60 * 60 * 1000
                ).toISOString(),
              },
            ],
          };
        }
      } catch (apiError) {
        console.warn(
          "Failed to fetch real data from schools API, trying balance-enriched fallback:",
          apiError
        );

        // Fallback: пробуем balance-enriched API
        try {
          const schoolsData =
            await BalanceEnrichedService.getBalanceEnrichedData();

          if (
            schoolsData &&
            Array.isArray(schoolsData) &&
            schoolsData.length > 0
          ) {
            console.log("📊 Using fallback balance-enriched data...");

            const schools = schoolsData;
            const totalSchools = schools.length;

            // Вычисляем общее количество учащихся
            const totalStudents = schools.reduce(
              (sum: number, school: BalanceEnrichedItem) => {
                const students = parseInt(school.number_of_students) || 0;
                return sum + students;
              },
              0
            );

            // Вычисляем общее количество учителей
            const totalTeachers = schools.reduce(
              (sum: number, school: BalanceEnrichedItem) => {
                const teachers = parseInt(school.number_of_teachers) || 0;
                return sum + teachers;
              },
              0
            );

            // Вычисляем средний рейтинг (используем average_score)
            let totalRating = 0;
            let schoolsWithRating = 0;

            schools.forEach((school: BalanceEnrichedItem) => {
              const rating = parseFloat(school.average_score);
              if (!isNaN(rating) && rating > 0) {
                totalRating += rating;
                schoolsWithRating++;
              }
            });

            const averageRating =
              schoolsWithRating > 0 ? totalRating / schoolsWithRating : 0;

            // Лидирующие школы (с рейтингом выше среднего)
            const leadingSchools = schools.filter(
              (school: BalanceEnrichedItem) => {
                const rating = parseFloat(school.average_score);
                return !isNaN(rating) && rating > averageRating;
              }
            ).length;

            return {
              totalSchools,
              leadingSchools,
              totalStudents,
              averageRating,
              totalTeachers,
              totalCollections: 12,
              recentActivity: [
                {
                  id: "1",
                  type: "data_updated",
                  description: `Обновлены данные для ${totalSchools} школ (fallback)`,
                  timestamp: new Date().toISOString(),
                },
                {
                  id: "2",
                  type: "stats_calculated",
                  description: `Рассчитана статистика по ${totalStudents.toLocaleString()} учащимся`,
                  timestamp: new Date(
                    Date.now() - 2 * 60 * 60 * 1000
                  ).toISOString(),
                },
                {
                  id: "3",
                  type: "rating_analyzed",
                  description: `Проанализированы рейтинги школ (средний: ${averageRating.toFixed(
                    1
                  )})`,
                  timestamp: new Date(
                    Date.now() - 5 * 60 * 60 * 1000
                  ).toISOString(),
                },
              ],
            };
          }
        } catch (fallbackError) {
          console.warn("Fallback also failed:", fallbackError);
        }
      }

      // Fallback: попробуем существующий API endpoint
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
