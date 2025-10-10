import {
  SchoolsApiResponse,
  SchoolFeature,
  MapFilters,
} from "@/types/schools-map";

const SCHOOLS_API_URL =
  "https://admin.smartalmaty.kz/api/v1/institutions-monitoring/schools/?limit=10000";

export class SchoolsMapService {
  /**
   * Загружает данные о школах с API и преобразует в GeoJSON формат
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
        count: data.count,
        results: data.results.length,
      });

      // Преобразуем данные в GeoJSON формат
      const features: SchoolFeature[] = data.results
        .filter((school) => school.infra && school.infra.origin_geom) // Только школы с геометрией
        .map((school) => {
          console.log("🔍 Processing school geometry:", {
            id: school.id,
            name: school.name_of_the_organization,
            geometryType: school.infra!.origin_geom.type,
            coordinatesLength: school.infra!.origin_geom.coordinates.length,
          });

          return {
            id: school.id,
            type: "Feature",
            geometry: {
              type: school.infra!.origin_geom.type,
              coordinates: school.infra!.origin_geom.coordinates,
            },
            properties: school,
          };
        });

      console.log(
        `Converted ${features.length} schools with geometry out of ${data.results.length} total`
      );
      return features;
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

      // Фильтр по поиску (название школы, район)
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const name = props.name_of_the_organization?.toLowerCase() || "";
        const district = props.district?.toLowerCase() || "";

        if (!name.includes(query) && !district.includes(query)) {
          return false;
        }
      }

      // Фильтр по типу образования
      if (filters.educationType && filters.educationType.length > 0) {
        if (
          !props.types_of_educational_institutions ||
          !filters.educationType.some((type) =>
            props.types_of_educational_institutions
              .toLowerCase()
              .includes(type.toLowerCase())
          )
        ) {
          return false;
        }
      }

      // Фильтр по типу собственности (приватность определяем по form_of_ownership)
      if (filters.isPrivate !== null && filters.isPrivate !== undefined) {
        const isPrivate = props.form_of_ownership?.includes("граждан") || false;
        if (isPrivate !== filters.isPrivate) {
          return false;
        }
      }

      // Фильтр по району
      if (filters.district && filters.district.length > 0) {
        if (!props.district || !filters.district.includes(props.district)) {
          return false;
        }
      }

      // Фильтр по рейтингу
      if (filters.ratingRange && props.gis_rating !== null) {
        const [minRating, maxRating] = filters.ratingRange;
        if (props.gis_rating < minRating || props.gis_rating > maxRating) {
          return false;
        }
      }

      // Фильтр по вместимости (используем contingency_filter)
      if (filters.capacityRange && props.contingency_filter !== null) {
        const [minCapacity, maxCapacity] = filters.capacityRange;
        if (
          props.contingency_filter < minCapacity ||
          props.contingency_filter > maxCapacity
        ) {
          return false;
        }
      }

      // Фильтр по статусу загруженности
      if (filters.overloadStatus && filters.overloadStatus.length > 0) {
        const schoolGroup = props.group_of_school?.toLowerCase() || "";
        const matchesStatus = filters.overloadStatus.some((status) => {
          switch (status) {
            case "overloaded":
              return schoolGroup.includes("перегружен");
            case "underloaded":
              return schoolGroup.includes("недозагружен");
            case "balanced":
              return (
                !schoolGroup.includes("перегружен") &&
                !schoolGroup.includes("недозагружен")
              );
            default:
              return false;
          }
        });
        if (!matchesStatus) {
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
      .map((school) => school.properties.types_of_educational_institutions)
      .filter((type): type is string => type !== null);
    return Array.from(new Set(types)).sort();
  }

  /**
   * Получает статистику по школам
   */
  static getSchoolsStatistics(schools: SchoolFeature[]) {
    const total = schools.length;
    const privateSchools = schools.filter(
      (s) => s.properties.form_of_ownership?.includes("граждан") || false
    ).length;
    const publicSchools = total - privateSchools;

    const avgRating =
      schools
        .filter((s) => s.properties.gis_rating !== null)
        .reduce((sum, s) => sum + (s.properties.gis_rating || 0), 0) /
      schools.filter((s) => s.properties.gis_rating !== null).length;

    // Статистика по загруженности (на основе group_of_school)
    const overloadedSchools = schools.filter(
      (s) =>
        s.properties.group_of_school?.toLowerCase().includes("перегружен") ||
        false
    ).length;

    const underloadedSchools = schools.filter(
      (s) =>
        s.properties.group_of_school?.toLowerCase().includes("недозагружен") ||
        false
    ).length;

    const balancedSchools = total - overloadedSchools - underloadedSchools;

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
      name: props.name_of_the_organization,
      district: props.district,
      rating: props.gis_rating,
      educationType: props.types_of_educational_institutions,
      isPrivate: props.form_of_ownership?.includes("граждан") || false,
      capacity: props.contingency_filter,
      coordinates: school.geometry.coordinates,
      ownership: props.form_of_ownership,
      affiliation: props.departmental_affiliation,
      schoolGroup: props.group_of_school,
      isClosed: props.is_closed_sign,
    };
  }
}
