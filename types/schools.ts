// Типы для системы цифрового рейтинга школ

export interface District {
  id: string;
  name: string;
  nameKz: string;
  nameRu: string;
}

export interface School {
  id: string;
  name: string;
  nameKz: string;
  nameRu: string;
  districtId: string;
  district: District;
  address: string;
  phone?: string;
  director: string;
  foundedYear: number;
  commissionedYear?: number;
  capacity: number;
  currentStudents: number;
  organizationType: string;
  coordinates?: {
    lat: number;
    lng: number;
  };

  // Рейтинги
  currentRating: number;
  q1Rating: number; // 1-я четверть
  q2Rating: number; // 2-я четверть
  q3Rating: number; // 3-я четверть
  yearlyRating: number; // Общий годовой

  // Показатели для расчета рейтинга
  indicators: SchoolIndicators;

  // Зона рейтинга
  ratingZone: "green" | "yellow" | "red";
}

export interface SchoolIndicators {
  K: number; // Качество знаний
  C: number; // Динамика результатов
  T: number; // Развитие талантов
  P: number; // Квалификация педагогов
  O: number; // Достижения педагогов
  A: number; // Оснащенность школы
  B: number; // Международные отношения
  M: number; // Безопасность
  V: number; // Воспитательная работа
  I: number; // Инклюзия и благоустройство
}

export interface RatingWeights {
  K: number;
  C: number;
  T: number;
  P: number;
  O: number;
  A: number;
  B: number;
  M: number;
  V: number;
  I: number;
}

// Детализированные показатели для паспорта
export interface QualityKnowledge {
  year1: number;
  year2: number;
  year3: number;
  trend: "up" | "down" | "stable";
}

export interface ResultsDynamics {
  graduates: number;
  altynBelgi: number;
  averageEntScore: number;
  grants: number;
  yearOverYearChange: {
    graduates: number;
    altynBelgi: number;
    averageEntScore: number;
    grants: number;
  };
}

export interface TalentDevelopment {
  schoolLevel: {
    participants: number;
    winners: number;
  };
  cityLevel: {
    participants: number;
    winners: number;
  };
  regionalLevel: {
    participants: number;
    winners: number;
  };
  nationalLevel: {
    participants: number;
    winners: number;
  };
  internationalLevel: {
    participants: number;
    winners: number;
  };
}

export interface TeacherQualification {
  categories: {
    highest: number;
    first: number;
    second: number;
    noCategory: number;
  };
  certifications: {
    certified: number;
    total: number;
    percentage: number;
  };
}

export interface TeacherAchievements {
  schoolLevel: number;
  cityLevel: number;
  regionalLevel: number;
  nationalLevel: number;
  internationalLevel: number;
}

export interface SchoolEquipment {
  totalRooms: number;
  newRooms: number;
  modernEquipmentPercentage: number;
  computerRooms: number;
  laboratories: number;
  libraries: number;
}

export interface InternationalRelations {
  partnerships: number;
  exchangePrograms: number;
  internationalProjects: number;
  foreignLanguagePrograms: string[];
}

export interface SchoolSafety {
  cctv: {
    indoor: number;
    outdoor: number;
    total: number;
  };
  turnstiles: number;
  panicButtons: number;
  securityGuards: number;
}

export interface EducationalWork {
  incidents: number;
  violations: number;
  staffTurnover: number;
  disciplinaryActions: number;
}

export interface InclusionAndImprovement {
  homeSchooling: number;
  accessibilityFeatures: string[];
  improvementProjects: number;
  greenSpaces: number;
}

export interface SchoolPassportData {
  school: School;
  qualityKnowledge: QualityKnowledge;
  resultsDynamics: ResultsDynamics;
  talentDevelopment: TalentDevelopment;
  teacherQualification: TeacherQualification;
  teacherAchievements: TeacherAchievements;
  schoolEquipment: SchoolEquipment;
  internationalRelations: InternationalRelations;
  schoolSafety: SchoolSafety;
  educationalWork: EducationalWork;
  inclusionAndImprovement: InclusionAndImprovement;
}

// Для фильтрации и поиска
export interface SchoolFilters {
  districtId?: string;
  search?: string;
  ratingZone?: "green" | "yellow" | "red";
  ratingRange?: {
    min: number;
    max: number;
  };
}

// Для экспорта
export interface ExportData {
  schools: School[];
  filters: SchoolFilters;
  timestamp: string;
}

// Статистика по районам
export interface DistrictStats {
  district: District;
  totalSchools: number;
  greenZone: number;
  yellowZone: number;
  redZone: number;
  averageRating: number;
}

// Для модального окна с таблицей школ
export interface SchoolModalData {
  title: string;
  schools: School[];
  zone?: "green" | "yellow" | "red";
  district?: District;
}

// Для круговых индикаторов рейтинга
export interface RatingIndicator {
  zone: "green" | "yellow" | "red";
  count: number;
  percentage: number;
  color: string;
  label: string;
}

// Данные для главной таблицы рейтингов со всеми показателями
export interface DetailedSchoolRating extends School {
  overallRating: number;
  qualityKnowledge: number;
  resultsDynamics: number;
  talentDevelopment: number;
  teacherQualification: number;
  teacherAchievements: number;
  schoolEquipment: number;
  internationalRelations: number;
  schoolSafety: number;
  educationalWork: number;
  inclusionAndImprovement: number;
  hasPassport: boolean;
}

// Настройки сортировки для таблицы
export interface TableSortConfig {
  column: keyof DetailedSchoolRating;
  order: "asc" | "desc";
}

// Фильтры для главной таблицы
export interface AdvancedSchoolFilters extends SchoolFilters {
  selectedSchools?: string[]; // для чекбоксов
  ratingMin?: number;
  ratingMax?: number;
  showPassportOnly?: boolean;
}

// Пользователи системы
export interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "user" | "viewer";
  createdAt: string;
  lastLogin?: string;
}
