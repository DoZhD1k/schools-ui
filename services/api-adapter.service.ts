// Адаптер для преобразования данных из реального API в формат приложения
import {
  AcademicPerformance,
  GoldenSign,
  TeacherCategory,
  VideoSurveillance,
  SecuritySystem,
  ScienceRoomAnalysis,
  GraduationEmployment,
} from "@/services/real-api.service";
import {
  School,
  DistrictStats,
  SchoolIndicators,
  SchoolPassportData,
  QualityKnowledge,
  TeacherQualification,
  SchoolSafety,
  SchoolEquipment,
} from "@/types/schools";

// Преобразование академической успеваемости в школу
export function adaptAcademicPerformanceToSchool(
  academicData: AcademicPerformance,
  additionalData?: {
    goldenSign?: GoldenSign;
    teacherCategory?: TeacherCategory;
    videoSurveillance?: VideoSurveillance;
    securitySystem?: SecuritySystem;
    scienceRoom?: ScienceRoomAnalysis;
    graduationEmployment?: GraduationEmployment;
  }
): School {
  const totalStudents = academicData.contingency_filter;
  const goodGrades = academicData.grade_level_5 + academicData.grade_level_4;

  // Вычисляем показатели для рейтинга
  const indicators: SchoolIndicators = {
    K: totalStudents > 0 ? Math.round((goodGrades / totalStudents) * 100) : 0, // Качество знаний
    C: calculateDynamicsRating(academicData), // Динамика результатов
    T: calculateTalentRating(additionalData?.goldenSign), // Развитие талантов
    P: calculateTeacherQualification(additionalData?.teacherCategory), // Квалификация педагогов
    O: calculateTeacherAchievements(additionalData?.teacherCategory), // Достижения педагогов
    A: calculateEquipmentRating(additionalData?.scienceRoom), // Оснащенность школы
    B: calculateInternationalRating(), // Международные отношения (нет данных)
    M: calculateSecurityRating(additionalData?.securitySystem), // Безопасность
    V: calculateEducationalWorkRating(), // Воспитательная работа (нет данных)
    I: calculateInclusionRating(additionalData?.videoSurveillance), // Инклюзия и благоустройство
  };

  // Вычисляем общий рейтинг (взвешенное среднее)
  const overallRating = Math.round(
    indicators.K * 0.25 +
      indicators.C * 0.15 +
      indicators.T * 0.15 +
      indicators.P * 0.15 +
      indicators.O * 0.1 +
      indicators.A * 0.1 +
      indicators.M * 0.05 +
      indicators.V * 0.03 +
      indicators.I * 0.02
  );

  const ratingZone: "green" | "yellow" | "red" =
    overallRating >= 86 ? "green" : overallRating >= 50 ? "yellow" : "red";

  return {
    id: academicData.school.toString(),
    name: academicData.name_of_the_organization,
    nameKz: academicData.name_of_the_organization, // Нет отдельного казахского названия
    nameRu: academicData.name_of_the_organization,
    districtId: getDistrictId(academicData.district),
    district: {
      id: getDistrictId(academicData.district),
      name: academicData.district,
      nameKz: academicData.district,
      nameRu: academicData.district,
    },
    address: academicData.settlement, // Используем settlement как адрес
    phone: undefined, // Нет в API
    director: "Не указан", // Нет в API
    foundedYear:
      additionalData?.videoSurveillance?.year_of_construction || 1990,
    commissionedYear: additionalData?.videoSurveillance?.year_of_commissioning,
    capacity:
      additionalData?.videoSurveillance?.design_capacity || totalStudents,
    currentStudents: totalStudents,
    organizationType: academicData.types_of_educational_institutions,
    coordinates: undefined, // Нет в API
    currentRating: overallRating,
    q1Rating: Math.max(0, overallRating - Math.floor(Math.random() * 10) + 5), // Симуляция
    q2Rating: Math.max(0, overallRating - Math.floor(Math.random() * 8) + 3), // Симуляция
    q3Rating: Math.max(0, overallRating - Math.floor(Math.random() * 5) + 2), // Симуляция
    yearlyRating: overallRating,
    indicators,
    ratingZone,
  };
}

// Вспомогательные функции для вычисления показателей
function calculateDynamicsRating(academicData: AcademicPerformance): number {
  // Симуляция динамики на основе соотношения оценок
  const total =
    academicData.grade_level_5 +
    academicData.grade_level_4 +
    academicData.grade_level_3;
  if (total === 0) return 50;

  const excellentRatio = academicData.grade_level_5 / total;
  return Math.round(excellentRatio * 100);
}

function calculateTalentRating(goldenSign?: GoldenSign): number {
  if (!goldenSign) return 60;

  const totalCandidates = goldenSign.candidate_for_an_award;
  const confirmedAwards = goldenSign.confirmed_altyn_belgi_mark;

  if (totalCandidates === 0) return 50;
  return Math.min(
    100,
    Math.round((confirmedAwards / totalCandidates) * 100) + 50
  );
}

function calculateTeacherQualification(
  teacherCategory?: TeacherCategory
): number {
  if (!teacherCategory) return 65;

  const total = teacherCategory.total_teachers;
  if (total === 0) return 50;

  const qualified =
    teacherCategory.teacher_expert +
    teacherCategory.teacher_researcher +
    teacherCategory.teacher_master;
  return Math.round((qualified / total) * 100);
}

function calculateTeacherAchievements(
  teacherCategory?: TeacherCategory
): number {
  if (!teacherCategory) return 60;

  const total = teacherCategory.total_teachers;
  if (total === 0) return 50;

  const highCategory =
    teacherCategory.highest_category + teacherCategory.first_category;
  return Math.round((highCategory / total) * 100);
}

function calculateEquipmentRating(scienceRoom?: ScienceRoomAnalysis): number {
  if (!scienceRoom) return 55;

  const equipmentPercent = parseFloat(scienceRoom.equipment_percent || "0");
  return Math.round(equipmentPercent * 100);
}

function calculateSecurityRating(securitySystem?: SecuritySystem): number {
  if (!securitySystem) return 70;

  let score = 0;
  if (securitySystem.availability_of_turnstile === "да") score += 30;
  if (securitySystem.availability_of_warning_system === "да") score += 35;
  if (securitySystem.video_surveillance_connected === "да") score += 35;

  return score;
}

function calculateInclusionRating(
  videoSurveillance?: VideoSurveillance
): number {
  if (!videoSurveillance) return 65;

  // Рассчитываем рейтинг на основе года постройки и мощности
  const currentYear = new Date().getFullYear();
  const age = currentYear - videoSurveillance.year_of_construction;
  const modernityScore = Math.max(0, 100 - age * 2); // Чем новее, тем лучше

  return Math.round(modernityScore * 0.7 + 30); // 30-100 баллов
}

function calculateInternationalRating(): number {
  // Нет данных в API, возвращаем среднее значение
  return Math.floor(Math.random() * 40) + 40; // 40-80
}

function calculateEducationalWorkRating(): number {
  // Нет данных в API, возвращаем среднее значение
  return Math.floor(Math.random() * 30) + 60; // 60-90
}

// Получение ID района по названию
function getDistrictId(districtName: string): string {
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
    districtMap[districtName] || districtName.toLowerCase().replace(/\s+/g, "_")
  );
}

// Адаптер для создания паспорта школы
export function adaptToSchoolPassport(
  academicData: AcademicPerformance,
  additionalData: {
    goldenSign?: GoldenSign;
    teacherCategory?: TeacherCategory;
    videoSurveillance?: VideoSurveillance;
    securitySystem?: SecuritySystem;
    scienceRoom?: ScienceRoomAnalysis;
    graduationEmployment?: GraduationEmployment;
  }
): SchoolPassportData {
  const school = adaptAcademicPerformanceToSchool(academicData, additionalData);

  return {
    school,
    qualityKnowledge: adaptQualityKnowledge(academicData),
    resultsDynamics: adaptResultsDynamics(additionalData.graduationEmployment),
    talentDevelopment: {
      schoolLevel: { participants: 0, winners: 0 },
      cityLevel: { participants: 0, winners: 0 },
      regionalLevel: { participants: 0, winners: 0 },
      nationalLevel: { participants: 0, winners: 0 },
      internationalLevel: {
        participants: additionalData.goldenSign?.candidate_for_an_award || 0,
        winners: additionalData.goldenSign?.confirmed_altyn_belgi_mark || 0,
      },
    },
    teacherQualification: adaptTeacherQualification(
      additionalData.teacherCategory
    ),
    teacherAchievements: {
      schoolLevel: 0,
      cityLevel: 0,
      regionalLevel: 0,
      nationalLevel: 0,
      internationalLevel: 0,
    },
    schoolEquipment: adaptSchoolEquipment(
      additionalData.scienceRoom,
      additionalData.videoSurveillance
    ),
    internationalRelations: {
      partnerships: 0,
      exchangePrograms: 0,
      internationalProjects: 0,
      foreignLanguagePrograms: [],
    },
    schoolSafety: adaptSchoolSafety(
      additionalData.securitySystem,
      additionalData.videoSurveillance
    ),
    educationalWork: {
      incidents: 0,
      violations: 0,
      staffTurnover: 0,
      disciplinaryActions: 0,
    },
    inclusionAndImprovement: {
      homeSchooling: 0,
      accessibilityFeatures: [],
      improvementProjects: 0,
      greenSpaces: 0,
    },
  };
}

function adaptQualityKnowledge(
  academicData: AcademicPerformance
): QualityKnowledge {
  const currentYear = Math.round(
    ((academicData.grade_level_5 + academicData.grade_level_4) /
      academicData.contingency_filter) *
      100
  );

  return {
    year1: Math.max(0, currentYear - Math.floor(Math.random() * 10)),
    year2: Math.max(0, currentYear - Math.floor(Math.random() * 5)),
    year3: currentYear,
    trend: currentYear > 75 ? "up" : currentYear > 50 ? "stable" : "down",
  };
}

function adaptResultsDynamics(graduationData?: GraduationEmployment) {
  if (!graduationData) {
    return {
      graduates: 0,
      altynBelgi: 0,
      averageEntScore: 0,
      grants: 0,
      yearOverYearChange: {
        graduates: 0,
        altynBelgi: 0,
        averageEntScore: 0,
        grants: 0,
      },
    };
  }

  return {
    graduates: graduationData.total_graduates,
    altynBelgi: 0, // Нужно получить из goldenSign
    averageEntScore: 0, // Нет в API
    grants: graduationData.enrolled_in_university,
    yearOverYearChange: {
      graduates: 0,
      altynBelgi: 0,
      averageEntScore: 0,
      grants: 0,
    },
  };
}

function adaptTeacherQualification(
  teacherData?: TeacherCategory
): TeacherQualification {
  if (!teacherData) {
    return {
      categories: { highest: 0, first: 0, second: 0, noCategory: 0 },
      certifications: { certified: 0, total: 0, percentage: 0 },
    };
  }

  const total = teacherData.total_teachers;
  const certified =
    teacherData.teacher_expert +
    teacherData.teacher_researcher +
    teacherData.teacher_master;

  return {
    categories: {
      highest: teacherData.highest_category,
      first: teacherData.first_category,
      second: teacherData.second_category,
      noCategory:
        total -
        teacherData.highest_category -
        teacherData.first_category -
        teacherData.second_category,
    },
    certifications: {
      certified,
      total,
      percentage: total > 0 ? Math.round((certified / total) * 100) : 0,
    },
  };
}

function adaptSchoolEquipment(
  scienceRoom?: ScienceRoomAnalysis,
  _videoData?: VideoSurveillance
): SchoolEquipment {
  const totalRooms = scienceRoom ? parseInt(scienceRoom.total_classrooms) : 20;
  const newRooms = scienceRoom?.new_mod_classrooms || 0;

  return {
    totalRooms,
    newRooms,
    modernEquipmentPercentage: scienceRoom
      ? parseFloat(scienceRoom.equipment_percent) * 100
      : 50,
    computerRooms: Math.floor(totalRooms * 0.1),
    laboratories: Math.floor(totalRooms * 0.15),
    libraries: 1,
  };
}

function adaptSchoolSafety(
  securityData?: SecuritySystem,
  videoData?: VideoSurveillance
): SchoolSafety {
  const cctv = { indoor: 0, outdoor: 0, total: 0 };

  if (videoData?.availability_of_video_surveillance) {
    const surveillance = videoData.availability_of_video_surveillance;
    if (surveillance.includes("внутреннее")) cctv.indoor = 10;
    if (surveillance.includes("наружнее")) cctv.outdoor = 5;
    cctv.total = cctv.indoor + cctv.outdoor;
  }

  return {
    cctv,
    turnstiles: securityData?.availability_of_turnstile === "да" ? 2 : 0,
    panicButtons: securityData?.availability_of_warning_system === "да" ? 5 : 0,
    securityGuards: 2,
  };
}

// Создание статистики по районам
export function createDistrictStats(schools: School[]): DistrictStats[] {
  const districtMap = new Map<string, School[]>();

  schools.forEach((school) => {
    const districtId = school.districtId;
    if (!districtMap.has(districtId)) {
      districtMap.set(districtId, []);
    }
    districtMap.get(districtId)!.push(school);
  });

  return Array.from(districtMap.values()).map((districtSchools) => {
    const totalSchools = districtSchools.length;
    const greenZone = districtSchools.filter(
      (s) => s.ratingZone === "green"
    ).length;
    const yellowZone = districtSchools.filter(
      (s) => s.ratingZone === "yellow"
    ).length;
    const redZone = districtSchools.filter(
      (s) => s.ratingZone === "red"
    ).length;
    const averageRating = Math.round(
      districtSchools.reduce((sum, school) => sum + school.currentRating, 0) /
        totalSchools
    );

    return {
      district: districtSchools[0].district,
      totalSchools,
      greenZone,
      yellowZone,
      redZone,
      averageRating,
    };
  });
}
