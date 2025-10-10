import {
  BalanceEnrichedItem,
        console.log("🔍 Raw API response type:", typeof data);
      console.log("🔍 Raw API response keys:", Object.keys(data));
      console.log("🔍 Raw API response:", data);

      let result: BalanceEnrichedItem[];
      if (Array.isArray(data)) {
        result = data;
      } else if (data.results && Array.isArray(data.results)) {
        result = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        result = data.data;
      } else {
        console.error("❌ Unexpected data structure:", data);
        // Если это объект, попробуем найти массив в его свойствах
        const possibleArrays = Object.values(data).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          console.log("🔍 Found array in object:", possibleArrays[0]);
          result = possibleArrays[0];
        } else {
          throw new Error(
            "Balance-enriched data should be an array or contain an array"
          );
        } SchoolLanguageMapping,
  SchoolProperties,
} from "@/types/schools-map";

export class BalanceEnrichedService {
  private static baseUrl =
    "https://admin.smartalmaty.kz/api/v1/institutions-monitoring";

  /**
   * Загружает данные balance-enriched (полигоны районов с номерами школ)
   */
  static async getBalanceEnrichedData(
    limit: number = 2500
  ): Promise<BalanceEnrichedItem[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/balance-enriched/?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch balance-enriched data: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("🔍 Balance-enriched API response:", data);
      console.log("🔍 Type of data:", typeof data);
      console.log("🔍 Is array:", Array.isArray(data));
      console.log("🔍 Has results:", "results" in data);
      console.log("🔍 Keys:", Object.keys(data));

      // Попробуем различные варианты структуры ответа
      let result;
      if (Array.isArray(data)) {
        result = data;
      } else if (data.results && Array.isArray(data.results)) {
        result = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        result = data.data;
      } else {
        console.error("❌ Unexpected data structure:", data);
        // Если это объект, попробуем найти массив в его свойствах
        const possibleArrays = Object.values(data).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          console.log("🔍 Found array in object:", possibleArrays[0]);
          result = possibleArrays[0];
        } else {
          throw new Error(
            "Balance-enriched data should be an array or contain an array"
          );
        }
      }

      if (!Array.isArray(result)) {
        console.error("❌ Balance-enriched data is not an array:", result);
        throw new Error("Balance-enriched data should be an array");
      }

      return result;
    } catch (error) {
      console.error("Error fetching balance-enriched data:", error);
      throw error;
    }
  }

  /**
   * Загружает информацию о школах
   */
  static async getSchoolsData(
    limit: number = 500
  ): Promise<SchoolProperties[]> {
    try {
      const response = await fetch(`${this.baseUrl}/schools/?limit=${limit}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch schools data: ${response.status}`);
      }

      const data = await response.json();
      console.log("🔍 Schools API response:", data);

      const result = data.results || data;
      if (!Array.isArray(result)) {
        console.error("❌ Schools data is not an array:", result);
        throw new Error("Schools data should be an array");
      }

      return result;
    } catch (error) {
      console.error("Error fetching schools data:", error);
      throw error;
    }
  }

  /**
   * Создает маппинг школ по языкам
   */
  static createSchoolLanguageMappings(
    balanceData: BalanceEnrichedItem[],
    schools: SchoolProperties[]
  ): SchoolLanguageMapping[] {
    const mappings: SchoolLanguageMapping[] = [];
    const schoolsMap = new Map<string, SchoolProperties>();

    // Создаем карту школ по ID для быстрого поиска
    schools.forEach((school) => {
      schoolsMap.set(school.id.toString(), school);
    });

    // Обрабатываем каждый элемент balance data
    balanceData.forEach((item) => {
      const languages: Array<
        keyof Pick<
          BalanceEnrichedItem,
          "bilingual" | "kazakh" | "russian" | "uyghur"
        >
      > = ["bilingual", "kazakh", "russian", "uyghur"];

      languages.forEach((language) => {
        const schoolNumber = item[language];
        if (schoolNumber && schoolNumber.trim() !== "") {
          // Ищем существующий маппинг или создаем новый
          let mapping = mappings.find(
            (m) =>
              m.schoolNumber === schoolNumber.trim() && m.language === language
          );

          if (!mapping) {
            const schoolInfo = schoolsMap.get(schoolNumber.trim());
            mapping = {
              schoolNumber: schoolNumber.trim(),
              language: language,
              schoolInfo: schoolInfo,
              districtPolygons: [],
            };
            mappings.push(mapping);
          }

          // Добавляем полигон района к этому маппингу
          if (item.geometry) {
            const polygon: DistrictPolygon = {
              id: item.id,
              type: "Feature",
              geometry: item.geometry,
              properties: item,
            };
            mapping.districtPolygons.push(polygon);
          }
        }
      });
    });

    return mappings;
  }

  /**
   * Фильтрует полигоны по выбранной школе
   */
  static filterPolygonsBySchool(
    mappings: SchoolLanguageMapping[],
    schoolNumber?: string,
    language?: "bilingual" | "kazakh" | "russian" | "uyghur" | null
  ): DistrictPolygon[] {
    let filteredMappings = mappings;

    // Фильтруем по номеру школы
    if (schoolNumber) {
      filteredMappings = filteredMappings.filter(
        (m) => m.schoolNumber === schoolNumber
      );
    }

    // Фильтруем по языку
    if (language) {
      filteredMappings = filteredMappings.filter(
        (m) => m.language === language
      );
    }

    // Собираем все полигоны из отфильтрованных маппингов
    const polygons: DistrictPolygon[] = [];
    filteredMappings.forEach((mapping) => {
      polygons.push(...mapping.districtPolygons);
    });

    return polygons;
  }

  /**
   * Ищет школы по названию
   */
  static searchSchools(
    mappings: SchoolLanguageMapping[],
    searchQuery: string
  ): SchoolLanguageMapping[] {
    if (!searchQuery.trim()) {
      return mappings;
    }

    const query = searchQuery.toLowerCase().trim();
    return mappings.filter((mapping) =>
      mapping.schoolInfo?.name_of_the_organization.toLowerCase().includes(query)
    );
  }

  /**
   * Получает уникальные школы из маппингов
   */
  static getUniqueSchools(mappings: SchoolLanguageMapping[]): Array<{
    schoolNumber: string;
    schoolInfo?: SchoolProperties;
    languages: Array<"bilingual" | "kazakh" | "russian" | "uyghur">;
  }> {
    const schoolsMap = new Map<
      string,
      {
        schoolNumber: string;
        schoolInfo?: SchoolProperties;
        languages: Set<"bilingual" | "kazakh" | "russian" | "uyghur">;
      }
    >();

    mappings.forEach((mapping) => {
      const existing = schoolsMap.get(mapping.schoolNumber);
      if (existing) {
        existing.languages.add(mapping.language);
      } else {
        schoolsMap.set(mapping.schoolNumber, {
          schoolNumber: mapping.schoolNumber,
          schoolInfo: mapping.schoolInfo,
          languages: new Set([mapping.language]),
        });
      }
    });

    return Array.from(schoolsMap.values()).map((item) => ({
      schoolNumber: item.schoolNumber,
      schoolInfo: item.schoolInfo,
      languages: Array.from(item.languages),
    }));
  }
}
