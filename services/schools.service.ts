import {
  School,
  District,
  SchoolFilters,
  DistrictStats,
  RatingWeights,
  SchoolPassportData,
} from "@/types/schools";
import {
  mockSchools,
  mockDistricts,
  defaultWeights,
  generateSchoolPassportData,
} from "@/lib/mock-data";

export class SchoolsService {
  private static schools: School[] = mockSchools;
  private static districts: District[] = mockDistricts;
  private static weights: RatingWeights = { ...defaultWeights };

  // Получить все районы
  static async getDistricts(): Promise<District[]> {
    await this.delay(300);
    return [...this.districts];
  }

  // Получить все школы с фильтрацией
  static async getSchools(filters?: SchoolFilters): Promise<School[]> {
    await this.delay(500);
    let filteredSchools = [...this.schools];

    if (filters?.districtId) {
      filteredSchools = filteredSchools.filter(
        (school) => school.districtId === filters.districtId
      );
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredSchools = filteredSchools.filter(
        (school) =>
          school.name.toLowerCase().includes(searchLower) ||
          school.nameRu.toLowerCase().includes(searchLower) ||
          school.nameKz.toLowerCase().includes(searchLower) ||
          school.address.toLowerCase().includes(searchLower) ||
          school.director.toLowerCase().includes(searchLower)
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
  }

  // Получить школу по ID
  static async getSchool(id: string): Promise<School | null> {
    await this.delay(200);
    return this.schools.find((school) => school.id === id) || null;
  }

  // Получить паспорт школы
  static async getSchoolPassport(
    id: string
  ): Promise<SchoolPassportData | null> {
    await this.delay(800);
    const school = this.schools.find((school) => school.id === id);
    if (!school) return null;

    return generateSchoolPassportData(school);
  }

  // Получить статистику по районам
  static async getDistrictStats(): Promise<DistrictStats[]> {
    await this.delay(600);
    const stats: DistrictStats[] = [];

    for (const district of this.districts) {
      const districtSchools = this.schools.filter(
        (school) => school.districtId === district.id
      );
      const totalSchools = districtSchools.length;
      const greenZone = districtSchools.filter(
        (school) => school.ratingZone === "green"
      ).length;
      const yellowZone = districtSchools.filter(
        (school) => school.ratingZone === "yellow"
      ).length;
      const redZone = districtSchools.filter(
        (school) => school.ratingZone === "red"
      ).length;
      const averageRating =
        totalSchools > 0
          ? Math.round(
              districtSchools.reduce(
                (sum, school) => sum + school.currentRating,
                0
              ) / totalSchools
            )
          : 0;

      stats.push({
        district,
        totalSchools,
        greenZone,
        yellowZone,
        redZone,
        averageRating,
      });
    }

    return stats;
  }

  // Получить общую статистику
  static async getOverallStats() {
    await this.delay(400);
    const totalSchools = this.schools.length;
    const greenZone = this.schools.filter(
      (school) => school.ratingZone === "green"
    ).length;
    const yellowZone = this.schools.filter(
      (school) => school.ratingZone === "yellow"
    ).length;
    const redZone = this.schools.filter(
      (school) => school.ratingZone === "red"
    ).length;
    const averageRating = Math.round(
      this.schools.reduce((sum, school) => sum + school.currentRating, 0) /
        totalSchools
    );

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
  }

  // Получить веса критериев
  static async getWeights(): Promise<RatingWeights> {
    await this.delay(200);
    return { ...this.weights };
  }

  // Обновить веса критериев
  static async updateWeights(newWeights: RatingWeights): Promise<void> {
    await this.delay(500);
    this.weights = { ...newWeights };
    // В реальном приложении здесь бы происходил пересчет рейтингов всех школ
  }

  // Экспорт данных в формате для Excel
  static async exportSchools(
    filters?: SchoolFilters
  ): Promise<Record<string, string | number>[]> {
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
  }

  // Получить топ школ
  static async getTopSchools(limit: number = 10): Promise<School[]> {
    await this.delay(300);
    return [...this.schools]
      .sort((a, b) => b.currentRating - a.currentRating)
      .slice(0, limit);
  }

  // Поиск школ для автокомплита
  static async searchSchools(
    query: string,
    limit: number = 10
  ): Promise<School[]> {
    await this.delay(200);
    if (!query || query.length < 2) return [];

    const queryLower = query.toLowerCase();
    return this.schools
      .filter(
        (school) =>
          school.name.toLowerCase().includes(queryLower) ||
          school.nameRu.toLowerCase().includes(queryLower) ||
          school.nameKz.toLowerCase().includes(queryLower)
      )
      .slice(0, limit);
  }

  // Получить школы для карты
  static async getSchoolsForMap(filters?: SchoolFilters): Promise<School[]> {
    const schools = await this.getSchools(filters);
    return schools.filter((school) => school.coordinates);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
