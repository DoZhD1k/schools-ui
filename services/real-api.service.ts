// Сервис для работы с реальными API данными
import { api } from "@/lib/axios";

const API_BASE_URL =
  "https://admin.smartalmaty.kz/api/v1/institutions-monitoring";

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Типы для API данных
export interface AcademicPerformance {
  school: number;
  region: string;
  district: string;
  settlement: string;
  name_of_the_organization: string;
  types_of_educational_institutions: string;
  form_of_ownership: string;
  departmental_affiliation: string;
  contingency_filter: number;
  grade_level_5: number;
  grade_level_4: number;
  grade_level_3: number;
  grade_level_2: number;
  not_applicable: number;
}

export interface GoldenSign {
  school: number;
  region: string;
  district: string;
  settlement: string;
  name_of_the_organization: string;
  types_of_educational_institutions: string;
  form_of_ownership: string;
  departmental_affiliation: string;
  kato_code: number;
  contingency_filter: number;
  candidate_for_an_award: number;
  candidate_with_kaz_education: number;
  candidate_with_rus_education: number;
  candidate_with_uzb_education: number;
  candidate_with_uig_education: number;
  candidate_with_tadj_education: number;
  confirmed_altyn_belgi_mark: number;
  confirmed_altyn_belgi_mark_kaz: number;
  confirmed_altyn_belgi_mark_rus: number;
  confirmed_altyn_belgi_mark_uzb: number;
  confirmed_altyn_belgi_mark_uig: number;
  confirmed_altyn_belgi_mark_tadj: number;
}

export interface GraduationEmployment {
  school: number;
  region: string;
  district: string;
  settlement: string;
  name_of_the_organization: string;
  type_of_educational_institution: string;
  kinds_of_educational_institutions: string;
  form_of_ownership: string;
  departmental_affiliation: string;
  territorial_affiliation: string;
  language_of_instruction: string;
  date_of_closure: string | null;
  total_graduates: number;
  total_enrolled_in_education: number;
  enrolled_in_university: number;
  enrolled_in_college: number;
  employed: number;
  employed_in_agriculture: number;
  employed_in_industry: number;
  employed_in_construction: number;
  employed_in_trade: number;
  employed_in_transport: number;
  employed_in_housing_and_utilities: number;
  employed_in_education: number;
  employed_in_healthcare: number;
  employed_in_household_services: number;
  employed_in_other: number;
  left_abroad_total: number;
  left_abroad_for_education: number;
  unemployed: number;
  unemployed_due_to_illness: number;
  unemployed_other_reasons: number;
  not_subject_to_education: number;
  not_subject_due_to_illness: number;
  not_subject_due_to_death: number;
  conscripted_to_army: number;
  empty: number;
}

export interface ScienceRoomAnalysis {
  school: number;
  district: string;
  school_name: string;
  total_classrooms: string;
  total_science_classrooms: string | null;
  new_mod_classrooms: number;
  non_equipped_classrooms: number;
  equipment_percent: string;
  coefficient: number;
}

export interface SecuritySystem {
  school: number;
  region: string;
  district: string;
  settlement: string;
  name_of_the_organization: string;
  type_of_educational_institution: string;
  kinds_of_educational_institutions: string;
  form_of_ownership: string;
  availability_of_turnstile: string;
  availability_of_warning_system: string;
  video_surveillance_connected: string;
}

export interface SubjectRoomAnalysis {
  id: number;
  district: string;
  school_name: string;
  total_classrooms: string;
  classroom_availability: number;
  new_mod_classrooms: number | null;
  until_2019: number;
  year_2019: number;
  year_2020: number;
  year_2021: number;
  year_2022: number;
  year_2023: number;
  year_2024_prev_mb: number | null;
  year_2024_reserve: number | null;
  year_2024_mb: number | null;
  ksh: number | null;
  year_2025_reserve: number | null;
  non_equipped_classrooms: number;
  subject: string;
  school: number;
}

export interface TeacherCategory {
  school: number;
  region: string;
  district: string;
  settlement: string;
  name_of_the_organization: string;
  kinds_of_educational_institutions: string;
  form_of_ownership: string;
  departmental_affiliation: string;
  territorial_affiliation: string;
  total_teachers: number;
  highest_category: number;
  first_category: number;
  second_category: number;
  teacher: number;
  teacher_moderator: number;
  teacher_expert: number;
  teacher_researcher: number;
  teacher_master: number;
}

export interface VideoSurveillance {
  school: number;
  region: string;
  district: string;
  settlement: string;
  name_of_the_organization: string;
  type_of_educational_institution: string;
  kinds_of_educational_institutions: string;
  form_of_ownership: string;
  type_of_building: string;
  year_of_construction: number;
  year_of_commissioning: number;
  design_capacity: number;
  availability_of_video_surveillance: string;
}

// Параметры для API запросов
export interface ApiParams {
  limit?: number;
  offset?: number;
  search?: string;
  district?: string;
  school?: number;
}

class RealApiService {
  private async fetchApi<T>(
    endpoint: string,
    params?: ApiParams
  ): Promise<ApiResponse<T>> {
    try {
      const response = await api.get<ApiResponse<T>>(
        `${API_BASE_URL}/${endpoint}/`,
        {
          params,
        }
      );

      return response.data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw new Error(`Failed to fetch ${endpoint} data`);
    }
  }

  // Получить академическую успеваемость 2023-2024
  async getAcademicPerformance(
    params?: ApiParams
  ): Promise<ApiResponse<AcademicPerformance>> {
    return this.fetchApi<AcademicPerformance>(
      "academic-performance2023-2024",
      params
    );
  }

  // Получить данные по Алтын белгі 2024
  async getGoldenSign(params?: ApiParams): Promise<ApiResponse<GoldenSign>> {
    return this.fetchApi<GoldenSign>("golden-sign2024", params);
  }

  // Получить данные по выпускникам и трудоустройству
  async getGraduationEmployment(
    params?: ApiParams
  ): Promise<ApiResponse<GraduationEmployment>> {
    return this.fetchApi<GraduationEmployment>(
      "graduation-and-employment2024",
      params
    );
  }

  // Получить анализ научных кабинетов
  async getScienceRoomAnalysis(
    params?: ApiParams
  ): Promise<ApiResponse<ScienceRoomAnalysis>> {
    return this.fetchApi<ScienceRoomAnalysis>("science-room-analysis", params);
  }

  // Получить данные о системах безопасности
  async getSecuritySystem(
    params?: ApiParams
  ): Promise<ApiResponse<SecuritySystem>> {
    return this.fetchApi<SecuritySystem>("security-system", params);
  }

  // Получить анализ предметных кабинетов
  async getSubjectRoomAnalysis(
    params?: ApiParams
  ): Promise<ApiResponse<SubjectRoomAnalysis>> {
    return this.fetchApi<SubjectRoomAnalysis>("subject-room-analysis", params);
  }

  // Получить данные о категориях учителей
  async getTeacherCategory(
    params?: ApiParams
  ): Promise<ApiResponse<TeacherCategory>> {
    return this.fetchApi<TeacherCategory>("teacher-category", params);
  }

  // Получить данные о видеонаблюдении
  async getVideoSurveillance(
    params?: ApiParams
  ): Promise<ApiResponse<VideoSurveillance>> {
    return this.fetchApi<VideoSurveillance>("video-surveillance2024", params);
  }

  // Получить все данные для конкретной школы
  async getSchoolData(schoolId: number) {
    const [
      academicPerformance,
      goldenSign,
      graduationEmployment,
      scienceRoom,
      securitySystem,
      subjectRoom,
      teacherCategory,
      videoSurveillance,
    ] = await Promise.allSettled([
      this.getAcademicPerformance({ school: schoolId }),
      this.getGoldenSign({ school: schoolId }),
      this.getGraduationEmployment({ school: schoolId }),
      this.getScienceRoomAnalysis({ school: schoolId }),
      this.getSecuritySystem({ school: schoolId }),
      this.getSubjectRoomAnalysis({ school: schoolId }),
      this.getTeacherCategory({ school: schoolId }),
      this.getVideoSurveillance({ school: schoolId }),
    ]);

    return {
      academicPerformance:
        academicPerformance.status === "fulfilled"
          ? academicPerformance.value
          : null,
      goldenSign: goldenSign.status === "fulfilled" ? goldenSign.value : null,
      graduationEmployment:
        graduationEmployment.status === "fulfilled"
          ? graduationEmployment.value
          : null,
      scienceRoom:
        scienceRoom.status === "fulfilled" ? scienceRoom.value : null,
      securitySystem:
        securitySystem.status === "fulfilled" ? securitySystem.value : null,
      subjectRoom:
        subjectRoom.status === "fulfilled" ? subjectRoom.value : null,
      teacherCategory:
        teacherCategory.status === "fulfilled" ? teacherCategory.value : null,
      videoSurveillance:
        videoSurveillance.status === "fulfilled"
          ? videoSurveillance.value
          : null,
    };
  }

  // Получить сводную статистику по всем районам
  async getDistrictStats() {
    try {
      // Получаем данные по академической успеваемости для всех школ
      const academicData = await this.getAcademicPerformance({ limit: 1000 });

      // Группируем по районам
      const districtMap = new Map<
        string,
        {
          district: string;
          schools: AcademicPerformance[];
          totalSchools: number;
          totalStudents: number;
          averagePerformance: number;
        }
      >();

      academicData.results.forEach((school) => {
        const districtName = school.district;

        if (!districtMap.has(districtName)) {
          districtMap.set(districtName, {
            district: districtName,
            schools: [],
            totalSchools: 0,
            totalStudents: 0,
            averagePerformance: 0,
          });
        }

        const districtData = districtMap.get(districtName)!;
        districtData.schools.push(school);
        districtData.totalSchools += 1;
        districtData.totalStudents += school.contingency_filter;
      });

      // Вычисляем средние показатели
      const districts = Array.from(districtMap.values()).map((district) => {
        const totalGrade5 = district.schools.reduce(
          (sum, school) => sum + school.grade_level_5,
          0
        );
        const totalGrade4 = district.schools.reduce(
          (sum, school) => sum + school.grade_level_4,
          0
        );
        const totalStudents = district.schools.reduce(
          (sum, school) => sum + school.contingency_filter,
          0
        );

        district.averagePerformance =
          totalStudents > 0
            ? Math.round(((totalGrade5 + totalGrade4) / totalStudents) * 100)
            : 0;

        return district;
      });

      return districts;
    } catch (error) {
      console.error("Error getting district stats:", error);
      return [];
    }
  }

  // Получить топ школ по успеваемости
  async getTopSchools(limit: number = 10) {
    try {
      const academicData = await this.getAcademicPerformance({ limit: 1000 });

      // Вычисляем рейтинг для каждой школы
      const schoolsWithRating = academicData.results.map((school) => {
        const totalStudents = school.contingency_filter;
        const goodGrades = school.grade_level_5 + school.grade_level_4;
        const rating =
          totalStudents > 0
            ? Math.round((goodGrades / totalStudents) * 100)
            : 0;

        return {
          ...school,
          rating,
          ratingZone:
            rating >= 86
              ? ("green" as const)
              : rating >= 50
              ? ("yellow" as const)
              : ("red" as const),
        };
      });

      // Сортируем по рейтингу и берем топ
      return schoolsWithRating
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    } catch (error) {
      console.error("Error getting top schools:", error);
      return [];
    }
  }

  // Поиск школ
  async searchSchools(query: string, limit: number = 10) {
    try {
      const academicData = await this.getAcademicPerformance({
        limit: 1000,
        search: query,
      });

      return academicData.results.slice(0, limit);
    } catch (error) {
      console.error("Error searching schools:", error);
      return [];
    }
  }
}

export const realApiService = new RealApiService();
