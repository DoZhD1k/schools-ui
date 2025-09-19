import {
  SchoolsApiResponse,
  SchoolFeature,
  MapFilters,
} from "@/types/schools-map";

const SCHOOLS_API_URL =
  "https://admin.smartalmaty.kz/api/v1/institutions_monitoring/schools-enriched/?limit=10000";

export class SchoolsMapService {
  /**
   * Загружает данные о школах с API
   */
  static async fetchSchools(): Promise<SchoolFeature[]> {
    try {
      console.log("Fetching schools from:", SCHOOLS_API_URL);

      const response = await fetch(SCHOOLS_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SchoolsApiResponse = await response.json();
      console.log("Received data:", {
        type: data.type,
        count: data.count,
        features: data.features.length,
      });

      return data.features;
    } catch (error) {
      console.error("Error fetching schools data:", error);
      throw new Error("Не удалось загрузить данные о школах");
    }
  }

  /**
   * Фильтрует школы согласно переданным фильтрам
   */
  static filterSchools(
    schools: SchoolFeature[],
    filters: MapFilters
  ): SchoolFeature[] {
    console.log("Filter input:", { filters, schoolsCount: schools.length });

    const result = schools.filter((school) => {
      const props = school.properties;

      // Фильтр по поиску (название школы, район, адрес)
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const name = props.organization_name?.toLowerCase() || "";
        const district = props.district?.toLowerCase() || "";
        const address = props.micro_district?.toLowerCase() || "";

        if (
          !name.includes(query) &&
          !district.includes(query) &&
          !address.includes(query)
        ) {
          return false;
        }
      }

      // Фильтр по типу образования
      if (filters.educationType && filters.educationType.length > 0) {
        if (
          !props.education_type ||
          !filters.educationType.includes(props.education_type)
        ) {
          return false;
        }
      }

      // Фильтр по типу собственности
      if (filters.isPrivate !== null && filters.isPrivate !== undefined) {
        if (props.is_private !== filters.isPrivate) {
          return false;
        }
      }

      // Фильтр по району
      if (filters.district && filters.district.length > 0) {
        if (!props.district || !filters.district.includes(props.district)) {
          return false;
        }
      }

      // Фильтр по статусу загруженности
      if (filters.overloadStatus && filters.overloadStatus.length > 0) {
        if (
          !props.overload_status ||
          !filters.overloadStatus.includes(props.overload_status)
        ) {
          return false;
        }
      }

      // Фильтр по рейтингу
      if (filters.ratingRange && props.rating !== null) {
        const [minRating, maxRating] = filters.ratingRange;
        if (props.rating < minRating || props.rating > maxRating) {
          return false;
        }
      }

      // Фильтр по вместимости
      if (filters.capacityRange && props.total_capacity !== null) {
        const [minCapacity, maxCapacity] = filters.capacityRange;
        if (
          props.total_capacity < minCapacity ||
          props.total_capacity > maxCapacity
        ) {
          return false;
        }
      }

      return true;
    });

    console.log("Filter result:", result.length);
    return result;
  }

  /**
   * Получает список уникальных районов
   */
  static getUniqueDistricts(schools: SchoolFeature[]): string[] {
    const districts = schools
      .map((school) => school.properties.district)
      .filter((district): district is string => district !== null);
    return Array.from(new Set(districts)).sort();
  }

  /**
   * Получает список уникальных типов образования
   */
  static getUniqueEducationTypes(schools: SchoolFeature[]): string[] {
    const types = schools
      .map((school) => school.properties.education_type)
      .filter((type): type is string => type !== null);
    return Array.from(new Set(types)).sort();
  }

  /**
   * Получает статистику по школам
   */
  static getSchoolsStatistics(schools: SchoolFeature[]) {
    const total = schools.length;
    const privateSchools = schools.filter(
      (s) => s.properties.is_private
    ).length;
    const publicSchools = total - privateSchools;

    const avgRating =
      schools
        .filter((s) => s.properties.rating !== null)
        .reduce((sum, s) => sum + (s.properties.rating || 0), 0) /
      schools.filter((s) => s.properties.rating !== null).length;

    const overloadedSchools = schools.filter(
      (s) => s.properties.overload_status === "overloaded"
    ).length;
    const balancedSchools = schools.filter(
      (s) => s.properties.overload_status === "balanced"
    ).length;
    const underloadedSchools = schools.filter(
      (s) => s.properties.overload_status === "underloaded"
    ).length;

    return {
      total,
      privateSchools,
      publicSchools,
      avgRating: Math.round(avgRating * 10) / 10,
      overloadedSchools,
      balancedSchools,
      underloadedSchools,
    };
  }

  /**
   * Форматирует данные для отображения в попапе
   */
  static formatSchoolData(school: SchoolFeature) {
    const props = school.properties;

    return {
      name: props.organization_name,
      note: props.note_from_list,
      address: props.micro_district,
      district: props.district,
      rating: props.rating,
      educationType: props.education_type,
      isPrivate: props.is_private,
      capacity: props.total_capacity,
      actualStudents: props.actual_students,
      overloadStatus: props.overload_status,
      deficit: props.deficit,
      surplus: props.surplus,
      coordinates: school.geometry.coordinates,
    };
  }
}
