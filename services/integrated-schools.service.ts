// Интегрированный сервис для работы с реальными API данными
import { realApiService, ApiParams } from "@/services/real-api.service";
import {
  adaptAcademicPerformanceToSchool,
  adaptToSchoolPassport,
  createDistrictStats,
} from "@/services/api-adapter.service";
import {
  School,
  District,
  SchoolFilters,
  DistrictStats,
  SchoolPassportData,
  RatingWeights,
} from "@/types/schools";

export class IntegratedSchoolsService {
  private static cache = new Map<
    string,
    { data: unknown; timestamp: number }
  >();
  private static cacheTimeout = 5 * 60 * 1000; // 5 минут

  private static async getFromCacheOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  // Получить все районы
  static async getDistricts(): Promise<District[]> {
    return this.getFromCacheOrFetch("districts", async () => {
      try {
        const academicData = await realApiService.getAcademicPerformance({
          limit: 1000,
        });
        const districts = new Set<string>();

        academicData.results.forEach((school) => {
          districts.add(school.district);
        });

        return Array.from(districts).map((districtName) => ({
          id: this.getDistrictId(districtName),
          name: districtName,
          nameKz: districtName,
          nameRu: districtName,
        }));
      } catch (error) {
        console.error("Error fetching districts:", error);
        return [];
      }
    });
  }

  // Получить все школы с фильтрацией
  static async getSchools(filters?: SchoolFilters): Promise<School[]> {
    const cacheKey = `schools-${JSON.stringify(filters || {})}`;

    return this.getFromCacheOrFetch(cacheKey, async () => {
      try {
        const params: any = { limit: 1000 };

        if (filters?.search) {
          params.search = filters.search;
        }

        const academicData = await realApiService.getAcademicPerformance(
          params
        );

        // Конвертируем данные в формат School БЕЗ дополнительных запросов
        // Дополнительные данные загружаются только при просмотре паспорта конкретной школы
        const schools = academicData.results.map((academicSchool) => {
          return adaptAcademicPerformanceToSchool(academicSchool);
        });

        // Применяем фильтры
        let filteredSchools = schools;

        if (filters?.districtId) {
          filteredSchools = filteredSchools.filter(
            (school) => school.districtId === filters.districtId
          );
        }

        if (filters?.ratingZone) {
          filteredSchools = filteredSchools.filter(
            (school) => school.ratingZone === filters.ratingZone
          );
        }

        if (filters?.ratingRange) {
          filteredSchools = filteredSchools.filter(
            (school) =>
              school.currentRating >= filters.ratingRange!.min &&
              school.currentRating <= filters.ratingRange!.max
          );
        }

        return filteredSchools;
      } catch (error) {
        console.error("Error fetching schools:", error);
        return [];
      }
    });
  }

  // Получить школу по ID
  static async getSchool(id: string): Promise<School | null> {
    try {
      const schoolId = parseInt(id);

      // ИСПРАВЛЕНИЕ: Получаем ВСЕ школы и ищем нужную по ID
      const academicData = await realApiService.getAcademicPerformance({
        limit: 1000,
      });

      // Ищем школу с нужным ID
      const schoolData = academicData.results.find(
        (school) => school.school === schoolId
      );

      if (!schoolData) {
        console.error(`School with ID ${schoolId} not found`);
        return null;
      }

      // Получаем дополнительные данные
      const additionalData = await realApiService.getSchoolData(schoolId);

      return adaptAcademicPerformanceToSchool(schoolData, {
        goldenSign: additionalData.goldenSign?.results[0],
        teacherCategory: additionalData.teacherCategory?.results[0],
        videoSurveillance: additionalData.videoSurveillance?.results[0],
        securitySystem: additionalData.securitySystem?.results[0],
        scienceRoom: additionalData.scienceRoom?.results[0],
        graduationEmployment: additionalData.graduationEmployment?.results[0],
      });
    } catch (error) {
      console.error("Error fetching school:", error);
      return null;
    }
  }

  // Получить паспорт школы
  static async getSchoolPassport(
    id: string
  ): Promise<SchoolPassportData | null> {
    try {
      const schoolId = parseInt(id);

      // ИСПРАВЛЕНИЕ: Получаем ВСЕ школы и ищем нужную по ID
      // Потому что параметр school в API не работает правильно
      const academicData = await realApiService.getAcademicPerformance({
        limit: 1000,
      });

      // Ищем школу с нужным ID
      const schoolData = academicData.results.find(
        (school) => school.school === schoolId
      );

      if (!schoolData) {
        console.error(`School with ID ${schoolId} not found`);
        return null;
      }

      console.log(
        `Found school: ${schoolData.name_of_the_organization} (ID: ${schoolId})`
      );

      // Получаем все данные для паспорта
      const additionalData = await realApiService.getSchoolData(schoolId);

      return adaptToSchoolPassport(schoolData, {
        goldenSign: additionalData.goldenSign?.results[0],
        teacherCategory: additionalData.teacherCategory?.results[0],
        videoSurveillance: additionalData.videoSurveillance?.results[0],
        securitySystem: additionalData.securitySystem?.results[0],
        scienceRoom: additionalData.scienceRoom?.results[0],
        graduationEmployment: additionalData.graduationEmployment?.results[0],
      });
    } catch (error) {
      console.error("Error fetching school passport:", error);
      return null;
    }
  }

  // Получить статистику по районам
  static async getDistrictStats(): Promise<DistrictStats[]> {
    return this.getFromCacheOrFetch("districtStats", async () => {
      try {
        const schools = await this.getSchools();
        return createDistrictStats(schools);
      } catch (error) {
        console.error("Error fetching district stats:", error);
        return [];
      }
    });
  }

  // Получить общую статистику
  static async getOverallStats() {
    return this.getFromCacheOrFetch("overallStats", async () => {
      try {
        const schools = await this.getSchools();
        const totalSchools = schools.length;
        const greenZone = schools.filter(
          (school) => school.ratingZone === "green"
        ).length;
        const yellowZone = schools.filter(
          (school) => school.ratingZone === "yellow"
        ).length;
        const redZone = schools.filter(
          (school) => school.ratingZone === "red"
        ).length;
        const averageRating =
          totalSchools > 0
            ? Math.round(
                schools.reduce((sum, school) => sum + school.currentRating, 0) /
                  totalSchools
              )
            : 0;

        return {
          totalSchools,
          greenZone,
          yellowZone,
          redZone,
          averageRating,
          greenPercentage: Math.round((greenZone / totalSchools) * 100),
          yellowPercentage: Math.round((yellowZone / totalSchools) * 100),
          redPercentage: Math.round((redZone / totalSchools) * 100),
        };
      } catch (error) {
        console.error("Error fetching overall stats:", error);
        return {
          totalSchools: 0,
          greenZone: 0,
          yellowZone: 0,
          redZone: 0,
          averageRating: 0,
          greenPercentage: 0,
          yellowPercentage: 0,
          redPercentage: 0,
        };
      }
    });
  }

  // Получить веса критериев (статические, так как нет API)
  static async getWeights(): Promise<RatingWeights> {
    return {
      K: 25, // Качество знаний
      C: 15, // Динамика результатов
      T: 15, // Развитие талантов
      P: 15, // Квалификация педагогов
      O: 10, // Достижения педагогов
      A: 10, // Оснащенность школы
      B: 5, // Международные отношения
      M: 3, // Безопасность
      V: 1, // Воспитательная работа
      I: 1, // Инклюзия и благоустройство
    };
  }

  // Обновить веса критериев (заглушка)
  static async updateWeights(newWeights: RatingWeights): Promise<void> {
    console.log("Weights updated:", newWeights);
    // В реальном приложении здесь был бы API запрос
  }

  // Экспорт данных в формате для Excel
  static async exportSchools(
    filters?: SchoolFilters
  ): Promise<Record<string, string | number>[]> {
    try {
      const schools = await this.getSchools(filters);

      return schools.map((school) => ({
        Наименование: school.nameRu,
        Район: school.district.nameRu,
        Адрес: school.address,
        Телефон: school.phone || "-",
        Директор: school.director,
        "Год основания": school.foundedYear,
        "Проектная мощность": school.capacity,
        "Количество учащихся": school.currentStudents,
        "Тип организации": school.organizationType,
        "Текущий рейтинг": school.currentRating,
        "1-я четверть": school.q1Rating,
        "2-я четверть": school.q2Rating,
        "3-я четверть": school.q3Rating,
        "Годовой рейтинг": school.yearlyRating,
        "Зона рейтинга":
          school.ratingZone === "green"
            ? "Зеленая"
            : school.ratingZone === "yellow"
            ? "Желтая"
            : "Красная",
        "K (Качество знаний)": school.indicators.K,
        "C (Динамика результатов)": school.indicators.C,
        "T (Развитие талантов)": school.indicators.T,
        "P (Квалификация педагогов)": school.indicators.P,
        "O (Достижения педагогов)": school.indicators.O,
        "A (Оснащенность школы)": school.indicators.A,
        "B (Международные отношения)": school.indicators.B,
        "M (Безопасность)": school.indicators.M,
        "V (Воспитательная работа)": school.indicators.V,
        "I (Инклюзия и благоустройство)": school.indicators.I,
      }));
    } catch (error) {
      console.error("Error exporting schools:", error);
      return [];
    }
  }

  // Получить топ школ
  static async getTopSchools(limit: number = 10): Promise<School[]> {
    try {
      const schools = await this.getSchools();
      return schools
        .sort((a, b) => b.currentRating - a.currentRating)
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching top schools:", error);
      return [];
    }
  }

  // Поиск школ для автокомплита
  static async searchSchools(
    query: string,
    limit: number = 10
  ): Promise<School[]> {
    try {
      if (!query || query.length < 2) return [];

      const schools = await this.getSchools({ search: query });
      return schools.slice(0, limit);
    } catch (error) {
      console.error("Error searching schools:", error);
      return [];
    }
  }

  // Получить школы для карты
  static async getSchoolsForMap(filters?: SchoolFilters): Promise<School[]> {
    try {
      const schools = await this.getSchools(filters);
      return schools.filter((school) => school.coordinates);
    } catch (error) {
      console.error("Error fetching schools for map:", error);
      return [];
    }
  }

  // Получить сводку по дашборду
  static async getDashboardData() {
    return this.getFromCacheOrFetch("dashboardData", async () => {
      try {
        const [overallStats, districtStats, topSchools] = await Promise.all([
          this.getOverallStats(),
          this.getDistrictStats(),
          this.getTopSchools(5),
        ]);

        // Получаем данные об Алтын белгі
        const goldenSignData = await realApiService.getGoldenSign({
          limit: 1000,
        });
        const totalGoldenSign = goldenSignData.results.reduce(
          (sum, school) => sum + school.confirmed_altyn_belgi_mark,
          0
        );

        // Получаем данные о выпускниках
        const graduationData = await realApiService.getGraduationEmployment({
          limit: 1000,
        });
        const totalGraduates = graduationData.results.reduce(
          (sum, school) => sum + school.total_graduates,
          0
        );
        const totalEmployed = graduationData.results.reduce(
          (sum, school) => sum + school.employed,
          0
        );

        return {
          overallStats,
          districtStats,
          topSchools,
          specialStats: {
            totalGoldenSign,
            totalGraduates,
            totalEmployed,
            employmentRate:
              totalGraduates > 0
                ? Math.round((totalEmployed / totalGraduates) * 100)
                : 0,
          },
        };
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return null;
      }
    });
  }

  private static getDistrictId(districtName: string): string {
    const districtMap: Record<string, string> = {
      "Алмалинский район": "almalinsky",
      "Ауэзовский район": "auezovsky",
      "Бостандыкский район": "bostandyksky",
      "Жетысуский район": "jetysusky",
      "Медеуский район": "medeuskiy",
      "Наурызбайский район": "nauryzbaysky",
      "Турксибский район": "turksibsky",
      Алатауский: "alatausky",
      "Алатауский район": "alatausky",
    };

    return (
      districtMap[districtName] ||
      districtName.toLowerCase().replace(/\s+/g, "_")
    );
  }

  // Обновить данные школы
  static async updateSchool(
    id: string,
    schoolData: Partial<School>
  ): Promise<School> {
    try {
      // TODO: Здесь должен быть реальный API запрос для обновления школы
      // Пока что возвращаем обновленные данные с симуляцией задержки
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const updatedSchool = await this.getSchool(id);
      if (!updatedSchool) {
        throw new Error(`School with ID ${id} not found`);
      }

      // В реальном приложении здесь был бы PUT/PATCH запрос:
      // const response = await axios.put(`/api/schools/${id}`, schoolData);
      // return response.data;

      console.log("School update data:", schoolData);

      // Возвращаем обновленную школу (в реальности данные пришли бы с сервера)
      return {
        ...updatedSchool,
        ...schoolData,
      };
    } catch (error) {
      console.error("Error updating school:", error);
      throw error;
    }
  }

  // Очистить кеш
  static clearCache(): void {
    this.cache.clear();
  }
}

// Экспортируем как замену оригинального сервиса
export { IntegratedSchoolsService as SchoolsService };
