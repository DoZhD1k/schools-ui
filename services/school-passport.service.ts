// Сервис для работы с паспортом школы
import { realApiService } from "@/services/real-api.service";
import {
  AcademicPerformance,
  GoldenSign,
  GraduationEmployment,
  ScienceRoomAnalysis,
  SecuritySystem,
  SubjectRoomAnalysis,
  TeacherCategory,
  VideoSurveillance,
} from "@/services/real-api.service";
import { adaptAcademicPerformanceToSchool } from "@/services/api-adapter.service";

export interface SchoolPassportData {
  // 1. Основная информация
  basicInfo: {
    id: string;
    nameRu: string;
    nameKz: string;
    district: string;
    address: string;
    phone: string | null;
    director: string | null;
    constructionYear: number | null;
    commissioningYear: number | null;
    designCapacity: number | null;
    currentStudentCount: number;
    organizationTypes: string;
    overallRating: number;
  };

  // 2. Качество знаний
  qualityKnowledge: {
    excellent: number; // Уровень "5"
    good: number; // Уровень "4"
    satisfactory: number; // Уровень "3"
    notProvided: number; // "не предоставляется"
    qualityRating: number; // Рейтинг качества знаний
  };

  // 3. Динамика результатов школы
  schoolResults: {
    graduatesCount: number;
    altynBelgiCount: number;
    averageUNTScore: number | null;
    grantReceiversCount: number;
    resultsRating: number;
  };

  // 4. Развитие талантов
  talentDevelopment: {
    cityWinners: number;
    republicWinners: number;
    internationalWinners: number;
    talentRating: number;
  };

  // 5. Классификация педагогов
  teacherClassification: {
    total: number;
    teacherMaster: number;
    teacherResearcher: number;
    teacherExpert: number;
    teacherModerator: number;
    teacher: number;
    certifiedFor3Years: number;
    classificationRating: number;
  };

  // 6. Профессиональные достижения педагогов
  teacherAchievements: {
    cityWinners: number;
    republicWinners: number;
    internationalWinners: number;
    achievementRating: number;
  };

  // 7. Оснащенность школы
  schoolEquipment: {
    totalClassrooms: number;
    newModificationClassrooms: number;
    equipmentRating: number;
  };

  // 8. Международные отношения
  internationalRelations: {
    studentParticipation: number;
    teacherParticipation: number;
    internationalRating: number;
  };

  // 9. Безопасность
  security: {
    videoSurveillanceSystem: boolean;
    turnstileSystem: boolean;
    warningSystem: boolean;
    securityRating: number;
  };

  // 10. Воспитательная работа
  educationalWork: {
    violationsCount: number;
    traumaCount: number;
    suicideCases: number;
    staffTurnover: number;
    educationalRating: number;
  };

  // 11. Инклюзия
  inclusion: {
    homeSchoolingStudents: number;
    territoryImprovement: number;
    inclusionRating: number;
  };
}

export class SchoolPassportService {
  // Получить полный паспорт школы по ID
  static async getSchoolPassport(
    schoolId: string
  ): Promise<SchoolPassportData | null> {
    try {
      const id = parseInt(schoolId);

      // Загружаем все необходимые данные параллельно
      const [
        academicData,
        goldenSignData,
        graduationData,
        scienceRoomData,
        subjectRoomData,
        securityData,
        teacherData,
        videoSurveillanceData,
      ] = await Promise.all([
        this.getAcademicDataForSchool(id),
        this.getGoldenSignData(id),
        this.getGraduationData(id),
        this.getScienceRoomData(id),
        this.getSubjectRoomData(id),
        this.getSecurityData(id),
        this.getTeacherData(id),
        this.getVideoSurveillanceData(id),
      ]);

      if (!academicData) {
        console.error(`School with ID ${id} not found in academic data`);
        return null;
      }

      return this.buildSchoolPassport(
        academicData,
        goldenSignData,
        graduationData,
        scienceRoomData,
        subjectRoomData,
        securityData,
        teacherData,
        videoSurveillanceData
      );
    } catch (error) {
      console.error("Error loading school passport:", error);
      return null;
    }
  }

  // Получить данные академической успеваемости для конкретной школы
  private static async getAcademicDataForSchool(
    schoolId: number
  ): Promise<AcademicPerformance | null> {
    try {
      const response = await realApiService.getAcademicPerformance({
        limit: 1000,
      });
      return (
        response.results.find((school) => school.school === schoolId) || null
      );
    } catch (error) {
      console.error("Error fetching academic data:", error);
      return null;
    }
  }

  // Получить данные об алтын белги для школы
  private static async getGoldenSignData(
    schoolId: number
  ): Promise<GoldenSign | null> {
    try {
      const response = await realApiService.getGoldenSign({ limit: 1000 });
      return response.results.find((data) => data.school === schoolId) || null;
    } catch (error) {
      console.error("Error fetching golden sign data:", error);
      return null;
    }
  }

  // Получить данные о выпускниках и трудоустройстве
  private static async getGraduationData(
    schoolId: number
  ): Promise<GraduationEmployment | null> {
    try {
      const response = await realApiService.getGraduationEmployment({
        limit: 1000,
      });
      return response.results.find((data) => data.school === schoolId) || null;
    } catch (error) {
      console.error("Error fetching graduation data:", error);
      return null;
    }
  }

  // Получить данные о научных кабинетах
  private static async getScienceRoomData(
    schoolId: number
  ): Promise<ScienceRoomAnalysis | null> {
    try {
      const response = await realApiService.getScienceRoomAnalysis({
        limit: 1000,
      });
      return response.results.find((data) => data.school === schoolId) || null;
    } catch (error) {
      console.error("Error fetching science room data:", error);
      return null;
    }
  }

  // Получить данные о предметных кабинетах
  private static async getSubjectRoomData(
    schoolId: number
  ): Promise<SubjectRoomAnalysis[]> {
    try {
      const response = await realApiService.getSubjectRoomAnalysis({
        limit: 1000,
      });
      return response.results.filter((data) => data.school === schoolId);
    } catch (error) {
      console.error("Error fetching subject room data:", error);
      return [];
    }
  }

  // Получить данные о безопасности
  private static async getSecurityData(
    schoolId: number
  ): Promise<SecuritySystem | null> {
    try {
      const response = await realApiService.getSecuritySystem({ limit: 1000 });
      return response.results.find((data) => data.school === schoolId) || null;
    } catch (error) {
      console.error("Error fetching security data:", error);
      return null;
    }
  }

  // Получить данные о педагогах
  private static async getTeacherData(
    schoolId: number
  ): Promise<TeacherCategory | null> {
    try {
      const response = await realApiService.getTeacherCategory({ limit: 1000 });
      return response.results.find((data) => data.school === schoolId) || null;
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      return null;
    }
  }

  // Получить данные о видеонаблюдении
  private static async getVideoSurveillanceData(
    schoolId: number
  ): Promise<VideoSurveillance | null> {
    try {
      const response = await realApiService.getVideoSurveillance({
        limit: 1000,
      });
      return (
        response.results.find(
          (data: VideoSurveillance) => data.school === schoolId
        ) || null
      );
    } catch (error) {
      console.error("Error fetching video surveillance data:", error);
      return null;
    }
  }

  // Собрать паспорт школы из всех данных
  private static buildSchoolPassport(
    academicData: AcademicPerformance,
    goldenSignData: GoldenSign | null,
    graduationData: GraduationEmployment | null,
    scienceRoomData: ScienceRoomAnalysis | null,
    subjectRoomData: SubjectRoomAnalysis[],
    securityData: SecuritySystem | null,
    teacherData: TeacherCategory | null,
    videoSurveillanceData: VideoSurveillance | null
  ): SchoolPassportData {
    // Получаем корректно рассчитанную школу из адаптера
    const adaptedSchool = adaptAcademicPerformanceToSchool(academicData, {
      goldenSign: goldenSignData || undefined,
      teacherCategory: teacherData || undefined,
      videoSurveillance: videoSurveillanceData || undefined,
      securitySystem: securityData || undefined,
      scienceRoom: scienceRoomData || undefined,
      graduationEmployment: graduationData || undefined,
    });

    // 1. Основная информация
    const basicInfo = {
      id: academicData.school.toString(),
      nameRu: academicData.name_of_the_organization,
      nameKz: academicData.name_of_the_organization, // В API нет отдельного казахского названия
      district: academicData.district,
      address: academicData.settlement,
      phone: null, // В API нет телефона
      director: null, // В API нет ФИО директора
      constructionYear: videoSurveillanceData?.year_of_construction || null,
      commissioningYear: videoSurveillanceData?.year_of_commissioning || null,
      designCapacity: videoSurveillanceData?.design_capacity || null,
      currentStudentCount: academicData.contingency_filter,
      organizationTypes: academicData.types_of_educational_institutions,
      overallRating: adaptedSchool.currentRating, // Используем корректный рейтинг из адаптера
    };

    // 2. Качество знаний
    const qualityKnowledge = {
      excellent: academicData.grade_level_5,
      good: academicData.grade_level_4,
      satisfactory: academicData.grade_level_3,
      notProvided: academicData.not_applicable,
      qualityRating: this.calculateQualityRating(academicData),
    };

    // 3. Динамика результатов школы
    const schoolResults = {
      graduatesCount: graduationData?.total_graduates || 0,
      altynBelgiCount: goldenSignData?.confirmed_altyn_belgi_mark || 0,
      averageUNTScore: null, // В API нет данных о среднем балле ЕНТ
      grantReceiversCount: graduationData?.total_enrolled_in_education || 0,
      resultsRating: this.calculateResultsRating(
        graduationData,
        goldenSignData
      ),
    };

    // 4. Развитие талантов
    const talentDevelopment = {
      cityWinners: 0, // В API нет данных о победителях олимпиад
      republicWinners: 0,
      internationalWinners: goldenSignData?.confirmed_altyn_belgi_mark || 0,
      talentRating: this.calculateTalentRating(goldenSignData),
    };

    // 5. Классификация педагогов
    const teacherClassification = {
      total: teacherData?.total_teachers || 0,
      teacherMaster: teacherData?.teacher_master || 0,
      teacherResearcher: teacherData?.teacher_researcher || 0,
      teacherExpert: teacherData?.teacher_expert || 0,
      teacherModerator: teacherData?.teacher_moderator || 0,
      teacher: teacherData?.teacher || 0,
      certifiedFor3Years: this.calculateCertified(teacherData),
      classificationRating:
        this.calculateTeacherClassificationRating(teacherData),
    };

    // 6. Профессиональные достижения педагогов
    const teacherAchievements = {
      cityWinners: 0, // В API нет данных о достижениях педагогов
      republicWinners: 0,
      internationalWinners: 0,
      achievementRating: this.calculateTeacherAchievementRating(),
    };

    // 7. Оснащенность школы
    const schoolEquipment = {
      totalClassrooms: parseInt(scienceRoomData?.total_classrooms || "0"),
      newModificationClassrooms: scienceRoomData?.new_mod_classrooms || 0,
      equipmentRating: this.calculateEquipmentRating(
        scienceRoomData,
        subjectRoomData
      ),
    };

    // 8. Международные отношения
    const internationalRelations = {
      studentParticipation: 0, // В API нет данных
      teacherParticipation: 0,
      internationalRating: this.calculateInternationalRating(),
    };

    // 9. Безопасность
    const security = {
      videoSurveillanceSystem:
        securityData?.video_surveillance_connected === "да",
      turnstileSystem: securityData?.availability_of_turnstile === "да",
      warningSystem: securityData?.availability_of_warning_system === "да",
      securityRating: this.calculateSecurityRating(securityData),
    };

    // 10. Воспитательная работа
    const educationalWork = {
      violationsCount: 0, // В API нет данных
      traumaCount: 0,
      suicideCases: 0,
      staffTurnover: 0,
      educationalRating: this.calculateEducationalRating(),
    };

    // 11. Инклюзия
    const inclusion = {
      homeSchoolingStudents: 0, // В API нет данных
      territoryImprovement: 0,
      inclusionRating: this.calculateInclusionRating(),
    };

    return {
      basicInfo,
      qualityKnowledge,
      schoolResults,
      talentDevelopment,
      teacherClassification,
      teacherAchievements,
      schoolEquipment,
      internationalRelations,
      security,
      educationalWork,
      inclusion,
    };
  }

  // Методы для вычисления рейтингов
  private static calculateOverallRating(
    academicData: AcademicPerformance,
    goldenSignData: GoldenSign | null,
    graduationData: GraduationEmployment | null,
    teacherData: TeacherCategory | null,
    securityData: SecuritySystem | null
  ): number {
    const qualityRating = this.calculateQualityRating(academicData);
    const resultsRating = this.calculateResultsRating(
      graduationData,
      goldenSignData
    );
    const talentRating = this.calculateTalentRating(goldenSignData);
    const teacherRating =
      this.calculateTeacherClassificationRating(teacherData);
    const securityRating = this.calculateSecurityRating(securityData);

    // Взвешенное среднее согласно ТЗ
    return Math.round(
      qualityRating * 0.25 +
        resultsRating * 0.2 +
        talentRating * 0.15 +
        teacherRating * 0.15 +
        securityRating * 0.1 +
        50 * 0.15 // Остальные показатели устанавливаем в 50% (средний уровень)
    );
  }

  private static calculateQualityRating(
    academicData: AcademicPerformance
  ): number {
    const total = academicData.contingency_filter;
    const goodGrades = academicData.grade_level_5 + academicData.grade_level_4;
    return total > 0 ? Math.round((goodGrades / total) * 100) : 0;
  }

  private static calculateResultsRating(
    graduationData: GraduationEmployment | null,
    goldenSignData: GoldenSign | null
  ): number {
    if (!graduationData) return 0;

    const graduates = graduationData.total_graduates;
    const enrolled = graduationData.total_enrolled_in_education;
    const altynBelgi = goldenSignData?.confirmed_altyn_belgi_mark || 0;

    if (graduates === 0) return 0;

    const enrollmentRate = (enrolled / graduates) * 100;
    const altynBelgiRate = (altynBelgi / graduates) * 100;

    return Math.round(enrollmentRate * 0.7 + altynBelgiRate * 0.3);
  }

  private static calculateTalentRating(
    goldenSignData: GoldenSign | null
  ): number {
    if (!goldenSignData) return 0;

    const candidates = goldenSignData.candidate_for_an_award;
    const confirmed = goldenSignData.confirmed_altyn_belgi_mark;

    if (candidates === 0) return 0;

    return Math.round((confirmed / candidates) * 100);
  }

  private static calculateTeacherClassificationRating(
    teacherData: TeacherCategory | null
  ): number {
    if (!teacherData) return 0;

    const total = teacherData.total_teachers;
    const qualified =
      teacherData.teacher_master +
      teacherData.teacher_researcher +
      teacherData.teacher_expert;

    if (total === 0) return 0;

    return Math.round((qualified / total) * 100);
  }

  private static calculateCertified(
    teacherData: TeacherCategory | null
  ): number {
    if (!teacherData) return 0;

    // Условно считаем, что все педагоги с категориями аттестованы
    return (
      teacherData.highest_category +
      teacherData.first_category +
      teacherData.second_category
    );
  }

  private static calculateTeacherAchievementRating(): number {
    return 0; // В API нет данных о достижениях педагогов
  }

  private static calculateEquipmentRating(
    scienceRoomData: ScienceRoomAnalysis | null,
    _subjectRoomData: SubjectRoomAnalysis[]
  ): number {
    if (!scienceRoomData) return 0;

    const equipmentPercent = parseFloat(
      scienceRoomData.equipment_percent || "0"
    );
    return Math.round(equipmentPercent * 100);
  }

  private static calculateInternationalRating(): number {
    return 0; // В API нет данных о международных отношениях
  }

  private static calculateSecurityRating(
    securityData: SecuritySystem | null
  ): number {
    if (!securityData) return 0;

    let score = 0;
    if (securityData.video_surveillance_connected === "да") score += 40;
    if (securityData.availability_of_turnstile === "да") score += 30;
    if (securityData.availability_of_warning_system === "да") score += 30;

    return score;
  }

  private static calculateEducationalRating(): number {
    return 0; // В API нет данных о воспитательной работе
  }

  private static calculateInclusionRating(): number {
    return 0; // В API нет данных об инклюзии
  }
}
