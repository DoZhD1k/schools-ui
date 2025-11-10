import {
  BalanceEnrichedItem,
  SchoolLanguageMapping,
  DistrictPolygon,
  SchoolProperties,
} from "@/types/schools-map";
import { api } from "@/lib/axios";

export class BalanceEnrichedService {
  /**
   * Загружает данные balance-enriched (полигоны районов с номерами школ)
   */
  static async getBalanceEnrichedData(
    limit: number = 2500
  ): Promise<BalanceEnrichedItem[]> {
    try {
      const response = await api.get("/balance-enriched/", {
        params: { limit },
      });

      const data = response.data;

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
      } else if (data.features && Array.isArray(data.features)) {
        // Обработка GeoJSON FeatureCollection
        console.log(
          "🔍 Found GeoJSON FeatureCollection with features:",
          data.features.length
        );
        result = data.features.map(
          (feature: { properties: any; geometry: any }) => ({
            ...feature.properties,
            geometry: feature.geometry,
          })
        );
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

      console.log("✅ Balance-enriched data loaded:", {
        count: result.length,
        firstItem: result[0],
      });

      return result;
    } catch (error) {
      console.error("❌ Error loading balance-enriched data:", error);
      throw error;
    }
  }

  /**
   * Загружает данные школ
   */
  static async getSchoolsData(
    limit: number = 500
  ): Promise<SchoolProperties[]> {
    try {
      const response = await api.get("/schools/", {
        params: { limit },
      });

      const data = response.data;

      let result: SchoolProperties[];
      if (Array.isArray(data)) {
        result = data;
      } else if (data.results && Array.isArray(data.results)) {
        result = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        result = data.data;
      } else {
        console.error("❌ Unexpected schools data structure:", data);
        // Если это объект, попробуем найти массив в его свойствах
        const possibleArrays = Object.values(data).filter(Array.isArray);
        if (possibleArrays.length > 0) {
          console.log("🔍 Found schools array in object:", possibleArrays[0]);
          result = possibleArrays[0];
        } else {
          console.warn(
            "⚠️ Schools data is not an array, returning empty array"
          );
          return [];
        }
      }

      console.log("✅ Schools data loaded:", {
        count: result.length,
        firstSchool: result[0],
      });

      return result;
    } catch (error) {
      console.error("❌ Error loading schools data:", error);
      throw error;
    }
  }

  /**
   * Создает маппинги школа-язык-полигоны из данных balance-enriched
   */
  static createSchoolLanguageMappings(
    balanceData: BalanceEnrichedItem[],
    schoolsData: SchoolProperties[]
  ): SchoolLanguageMapping[] {
    console.log("🔄 Creating school-language mappings...");

    // Создаем карту школ для быстрого поиска
    const schoolsMap = new Map<string, SchoolProperties>();
    schoolsData.forEach((school) => {
      const id = school.id?.toString() || "";
      if (id) {
        schoolsMap.set(id, school);
      }
    });

    const mappings: SchoolLanguageMapping[] = [];

    balanceData.forEach((item) => {
      // Проверяем каждый язык
      const languages: Array<"bilingual" | "kazakh" | "russian" | "uyghur"> = [
        "bilingual",
        "kazakh",
        "russian",
        "uyghur",
      ];

      languages.forEach((language) => {
        const schoolNumber = item[language];
        if (!schoolNumber || schoolNumber.trim() === "") {
          return; // Пропускаем пустые значения
        }

        // Ищем существующий маппинг для этой школы и языка
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
      });
    });

    console.log("✅ School-language mappings created:", {
      totalMappings: mappings.length,
      schoolsWithMappings: new Set(mappings.map((m) => m.schoolNumber)).size,
      languageDistribution: {
        bilingual: mappings.filter((m) => m.language === "bilingual").length,
        kazakh: mappings.filter((m) => m.language === "kazakh").length,
        russian: mappings.filter((m) => m.language === "russian").length,
        uyghur: mappings.filter((m) => m.language === "uyghur").length,
      },
    });

    return mappings;
  }

  /**
   * Фильтрует полигоны по выбранной школе и языку
   */
  static filterPolygonsBySchool(
    mappings: SchoolLanguageMapping[],
    selectedSchool?: { schoolNumber: string },
    selectedLanguage?: "bilingual" | "kazakh" | "russian" | "uyghur"
  ): DistrictPolygon[] {
    let filteredMappings = mappings;

    if (selectedSchool) {
      filteredMappings = filteredMappings.filter(
        (mapping) => mapping.schoolNumber === selectedSchool.schoolNumber
      );
    }

    if (selectedLanguage) {
      filteredMappings = filteredMappings.filter(
        (mapping) => mapping.language === selectedLanguage
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
        languages: Array<"bilingual" | "kazakh" | "russian" | "uyghur">;
      }
    >();

    mappings.forEach((mapping) => {
      const existing = schoolsMap.get(mapping.schoolNumber);
      if (existing) {
        if (!existing.languages.includes(mapping.language)) {
          existing.languages.push(mapping.language);
        }
      } else {
        schoolsMap.set(mapping.schoolNumber, {
          schoolNumber: mapping.schoolNumber,
          schoolInfo: mapping.schoolInfo,
          languages: [mapping.language],
        });
      }
    });

    return Array.from(schoolsMap.values());
  }
}
