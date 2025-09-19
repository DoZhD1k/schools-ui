import {
  District,
  School,
  RatingWeights,
  SchoolPassportData,
  QualityKnowledge,
  ResultsDynamics,
  TalentDevelopment,
  TeacherQualification,
  TeacherAchievements,
  SchoolEquipment,
  InternationalRelations,
  SchoolSafety,
  EducationalWork,
  InclusionAndImprovement,
  User,
} from "@/types/schools";

export const mockDistricts: District[] = [
  { id: "1", name: "Almaly", nameKz: "Алмалы", nameRu: "Алмалинский" },
  { id: "2", name: "Auezov", nameKz: "Әуезов", nameRu: "Ауэзовский" },
  { id: "3", name: "Bostandyk", nameKz: "Бостандық", nameRu: "Бостандыкский" },
  { id: "4", name: "Jetysu", nameKz: "Жетісу", nameRu: "Жетысуский" },
  { id: "5", name: "Medeu", nameKz: "Медеу", nameRu: "Медеуский" },
  { id: "6", name: "Nauryzbay", nameKz: "Наурызбай", nameRu: "Наурызбайский" },
  { id: "7", name: "Turksib", nameKz: "Түркісіб", nameRu: "Турксибский" },
  { id: "8", name: "Alatau", nameKz: "Алатау", nameRu: "Алатауский" },
];

const generateSchoolRating = (): number => Math.floor(Math.random() * 95) + 5;

const getRatingZone = (rating: number): "green" | "yellow" | "red" => {
  if (rating >= 86) return "green";
  if (rating >= 50) return "yellow";
  return "red";
};

const generateIndicators = () => ({
  K: Math.floor(Math.random() * 100),
  C: Math.floor(Math.random() * 100),
  T: Math.floor(Math.random() * 100),
  P: Math.floor(Math.random() * 100),
  O: Math.floor(Math.random() * 100),
  A: Math.floor(Math.random() * 100),
  B: Math.floor(Math.random() * 100),
  M: Math.floor(Math.random() * 100),
  V: Math.floor(Math.random() * 100),
  I: Math.floor(Math.random() * 100),
});

export const mockSchools: School[] = [
  // Алмалинский район
  {
    id: "1",
    name: "Nazarbayev Intellectual School Almaty",
    nameKz: "Назарбаев Зияткерлік мектебі Алматы",
    nameRu: "Назарбаев Интеллектуальная школа Алматы",
    districtId: "1",
    district: mockDistricts[0],
    address: "ул. Жандосова, 140",
    phone: "+7 (727) 355-40-00",
    director: "Абдрахманова Алия Серикбаевна",
    foundedYear: 2008,
    commissionedYear: 2008,
    capacity: 720,
    currentStudents: 695,
    organizationType: "Специализированная школа для одаренных детей",
    coordinates: { lat: 43.222, lng: 76.8512 },
    currentRating: 96,
    q1Rating: 94,
    q2Rating: 95,
    q3Rating: 97,
    yearlyRating: 95,
    indicators: generateIndicators(),
    ratingZone: "green",
  },
  {
    id: "2",
    name: "School-gymnasium №128",
    nameKz: "№128 мектеп-гимназия",
    nameRu: "Школа-гимназия №128",
    districtId: "1",
    district: mockDistricts[0],
    address: "ул. Розыбакиева, 247",
    phone: "+7 (727) 392-15-28",
    director: "Касымова Жанар Абильдаевна",
    foundedYear: 1985,
    commissionedYear: 1985,
    capacity: 1200,
    currentStudents: 1156,
    organizationType: "Общеобразовательная школа-гимназия",
    coordinates: { lat: 43.2156, lng: 76.8485 },
    currentRating: 89,
    q1Rating: 87,
    q2Rating: 88,
    q3Rating: 91,
    yearlyRating: 88,
    indicators: generateIndicators(),
    ratingZone: "green",
  },
  {
    id: "3",
    name: "Comprehensive School №89",
    nameKz: "№89 жалпы білім беретін мектеп",
    nameRu: "Общеобразовательная школа №89",
    districtId: "1",
    district: mockDistricts[0],
    address: "ул. Маметовой, 89",
    phone: "+7 (727) 267-23-45",
    director: "Нурланова Гулжан Тахировна",
    foundedYear: 1975,
    capacity: 800,
    currentStudents: 745,
    organizationType: "Общеобразовательная школа",
    coordinates: { lat: 43.2089, lng: 76.8391 },
    currentRating: 67,
    q1Rating: 65,
    q2Rating: 68,
    q3Rating: 69,
    yearlyRating: 67,
    indicators: generateIndicators(),
    ratingZone: "yellow",
  },
  // Ауэзовский район
  {
    id: "4",
    name: "Kazakh-Turkish Lyceum",
    nameKz: "Қазақ-түрік лицейі",
    nameRu: "Казахско-турецкий лицей",
    districtId: "2",
    district: mockDistricts[1],
    address: "мкр. Аксай-4, д. 62А",
    phone: "+7 (727) 396-80-15",
    director: "Ахметов Серик Болатович",
    foundedYear: 1992,
    capacity: 600,
    currentStudents: 578,
    organizationType: "Лицей",
    coordinates: { lat: 43.1789, lng: 76.8956 },
    currentRating: 92,
    q1Rating: 90,
    q2Rating: 93,
    q3Rating: 94,
    yearlyRating: 92,
    indicators: generateIndicators(),
    ratingZone: "green",
  },
  {
    id: "5",
    name: "School №165",
    nameKz: "№165 мектеп",
    nameRu: "Школа №165",
    districtId: "2",
    district: mockDistricts[1],
    address: "ул. Утеген батыра, 142",
    phone: "+7 (727) 398-67-23",
    director: "Смагулова Айгерим Ерлановна",
    foundedYear: 1988,
    capacity: 1000,
    currentStudents: 987,
    organizationType: "Общеобразовательная школа",
    coordinates: { lat: 43.1895, lng: 76.8723 },
    currentRating: 74,
    q1Rating: 72,
    q2Rating: 75,
    q3Rating: 76,
    yearlyRating: 74,
    indicators: generateIndicators(),
    ratingZone: "yellow",
  },
  {
    id: "6",
    name: "School №98",
    nameKz: "№98 мектеп",
    nameRu: "Школа №98",
    districtId: "2",
    district: mockDistricts[1],
    address: "ул. Толе би, 89",
    phone: "+7 (727) 291-45-67",
    director: "Тлеубаева Салтанат Мухтаровна",
    foundedYear: 1965,
    capacity: 650,
    currentStudents: 623,
    organizationType: "Общеобразовательная школа",
    coordinates: { lat: 43.2123, lng: 76.8634 },
    currentRating: 43,
    q1Rating: 41,
    q2Rating: 44,
    q3Rating: 45,
    yearlyRating: 43,
    indicators: generateIndicators(),
    ratingZone: "red",
  },
  // Бостандыкский район
  {
    id: "7",
    name: "Haileybury Almaty",
    nameKz: "Хейлибери Алматы",
    nameRu: "Хейлибери Алматы",
    districtId: "3",
    district: mockDistricts[2],
    address: "ул. Жубанова, 36",
    phone: "+7 (727) 355-35-35",
    director: "Wilson James Michael",
    foundedYear: 2008,
    capacity: 500,
    currentStudents: 478,
    organizationType: "Международная школа",
    coordinates: { lat: 43.2634, lng: 76.9456 },
    currentRating: 98,
    q1Rating: 97,
    q2Rating: 98,
    q3Rating: 99,
    yearlyRating: 98,
    indicators: generateIndicators(),
    ratingZone: "green",
  },
  {
    id: "8",
    name: "School-lyceum №204",
    nameKz: "№204 мектеп-лицей",
    nameRu: "Школа-лицей №204",
    districtId: "3",
    district: mockDistricts[2],
    address: "ул. Богенбай батыра, 234",
    phone: "+7 (727) 267-89-45",
    director: "Жолдыбаева Перизат Кайратовна",
    foundedYear: 1995,
    capacity: 900,
    currentStudents: 867,
    organizationType: "Школа-лицей",
    coordinates: { lat: 43.2567, lng: 76.9234 },
    currentRating: 85,
    q1Rating: 83,
    q2Rating: 86,
    q3Rating: 87,
    yearlyRating: 85,
    indicators: generateIndicators(),
    ratingZone: "yellow",
  },
];

// Дополним массив школ до достаточного количества для демонстрации
for (let i = 9; i <= 50; i++) {
  const districtIndex = Math.floor(Math.random() * mockDistricts.length);
  const district = mockDistricts[districtIndex];
  const rating = generateSchoolRating();

  mockSchools.push({
    id: i.toString(),
    name: `School №${i}`,
    nameKz: `№${i} мектеп`,
    nameRu: `Школа №${i}`,
    districtId: district.id,
    district,
    address: `ул. Тестовая, ${i}`,
    phone: `+7 (727) ${200 + i}-${10 + i}-${20 + i}`,
    director: `Директор ${i}`,
    foundedYear: 1960 + Math.floor(Math.random() * 60),
    capacity: 600 + Math.floor(Math.random() * 800),
    currentStudents: 500 + Math.floor(Math.random() * 700),
    organizationType: "Общеобразовательная школа",
    coordinates: {
      lat: 43.2 + (Math.random() - 0.5) * 0.2,
      lng: 76.85 + (Math.random() - 0.5) * 0.3,
    },
    currentRating: rating,
    q1Rating: rating + Math.floor((Math.random() - 0.5) * 6),
    q2Rating: rating + Math.floor((Math.random() - 0.5) * 6),
    q3Rating: rating + Math.floor((Math.random() - 0.5) * 6),
    yearlyRating: rating + Math.floor((Math.random() - 0.5) * 4),
    indicators: generateIndicators(),
    ratingZone: getRatingZone(rating),
  });
}

export const defaultWeights: RatingWeights = {
  K: 15, // Качество знаний
  C: 12, // Динамика результатов
  T: 10, // Развитие талантов
  P: 12, // Квалификация педагогов
  O: 8, // Достижения педагогов
  A: 10, // Оснащенность школы
  B: 8, // Международные отношения
  M: 10, // Безопасность
  V: 8, // Воспитательная работа
  I: 7, // Инклюзия и благоустройство
};

export const mockUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@schools.kz",
    role: "admin",
    createdAt: "2024-01-15T10:30:00Z",
    lastLogin: "2024-09-19T09:15:00Z",
  },
  {
    id: "2",
    username: "analyst",
    email: "analyst@schools.kz",
    role: "user",
    createdAt: "2024-02-20T14:20:00Z",
    lastLogin: "2024-09-18T16:45:00Z",
  },
  {
    id: "3",
    username: "viewer",
    email: "viewer@schools.kz",
    role: "viewer",
    createdAt: "2024-03-10T11:00:00Z",
    lastLogin: "2024-09-17T08:30:00Z",
  },
];

// Функция для генерации детализированных данных паспорта школы
export const generateSchoolPassportData = (
  school: School
): SchoolPassportData => {
  const qualityKnowledge: QualityKnowledge = {
    year1: 75 + Math.floor(Math.random() * 20),
    year2: 78 + Math.floor(Math.random() * 18),
    year3: 80 + Math.floor(Math.random() * 15),
    trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as
      | "up"
      | "down"
      | "stable",
  };

  const resultsDynamics: ResultsDynamics = {
    graduates: 45 + Math.floor(Math.random() * 30),
    altynBelgi: Math.floor(Math.random() * 8),
    averageEntScore: 85 + Math.floor(Math.random() * 30),
    grants: 15 + Math.floor(Math.random() * 20),
    yearOverYearChange: {
      graduates: Math.floor((Math.random() - 0.5) * 10),
      altynBelgi: Math.floor((Math.random() - 0.5) * 4),
      averageEntScore: Math.floor((Math.random() - 0.5) * 15),
      grants: Math.floor((Math.random() - 0.5) * 8),
    },
  };

  const talentDevelopment: TalentDevelopment = {
    schoolLevel: {
      participants: 150 + Math.floor(Math.random() * 100),
      winners: 45 + Math.floor(Math.random() * 30),
    },
    cityLevel: {
      participants: 25 + Math.floor(Math.random() * 25),
      winners: 8 + Math.floor(Math.random() * 12),
    },
    regionalLevel: {
      participants: 8 + Math.floor(Math.random() * 15),
      winners: 2 + Math.floor(Math.random() * 6),
    },
    nationalLevel: {
      participants: 2 + Math.floor(Math.random() * 8),
      winners: Math.floor(Math.random() * 3),
    },
    internationalLevel: {
      participants: Math.floor(Math.random() * 5),
      winners: Math.floor(Math.random() * 2),
    },
  };

  const totalTeachers = 45 + Math.floor(Math.random() * 35);
  const teacherQualification: TeacherQualification = {
    categories: {
      highest: Math.floor(totalTeachers * 0.2),
      first: Math.floor(totalTeachers * 0.35),
      second: Math.floor(totalTeachers * 0.25),
      noCategory: Math.floor(totalTeachers * 0.2),
    },
    certifications: {
      certified: Math.floor(totalTeachers * (0.7 + Math.random() * 0.25)),
      total: totalTeachers,
      percentage: 0,
    },
  };
  teacherQualification.certifications.percentage = Math.round(
    (teacherQualification.certifications.certified / totalTeachers) * 100
  );

  const teacherAchievements: TeacherAchievements = {
    schoolLevel: 8 + Math.floor(Math.random() * 12),
    cityLevel: 3 + Math.floor(Math.random() * 8),
    regionalLevel: 1 + Math.floor(Math.random() * 5),
    nationalLevel: Math.floor(Math.random() * 3),
    internationalLevel: Math.floor(Math.random() * 2),
  };

  const schoolEquipment: SchoolEquipment = {
    totalRooms: 35 + Math.floor(Math.random() * 25),
    newRooms: 5 + Math.floor(Math.random() * 15),
    modernEquipmentPercentage: 60 + Math.floor(Math.random() * 35),
    computerRooms: 2 + Math.floor(Math.random() * 3),
    laboratories: 3 + Math.floor(Math.random() * 5),
    libraries: 1,
  };

  const internationalRelations: InternationalRelations = {
    partnerships: Math.floor(Math.random() * 8),
    exchangePrograms: Math.floor(Math.random() * 5),
    internationalProjects: Math.floor(Math.random() * 6),
    foreignLanguagePrograms: [
      "Английский язык",
      "Немецкий язык",
      "Французский язык",
    ].slice(0, 1 + Math.floor(Math.random() * 3)),
  };

  const schoolSafety: SchoolSafety = {
    cctv: {
      indoor: 12 + Math.floor(Math.random() * 18),
      outdoor: 8 + Math.floor(Math.random() * 12),
      total: 0,
    },
    turnstiles: 2 + Math.floor(Math.random() * 4),
    panicButtons: 4 + Math.floor(Math.random() * 8),
    securityGuards: 2 + Math.floor(Math.random() * 3),
  };
  schoolSafety.cctv.total =
    schoolSafety.cctv.indoor + schoolSafety.cctv.outdoor;

  const educationalWork: EducationalWork = {
    incidents: Math.floor(Math.random() * 8),
    violations: Math.floor(Math.random() * 12),
    staffTurnover: Math.floor(Math.random() * 15),
    disciplinaryActions: Math.floor(Math.random() * 10),
  };

  const inclusionAndImprovement: InclusionAndImprovement = {
    homeSchooling: Math.floor(Math.random() * 12),
    accessibilityFeatures: [
      "Пандусы",
      "Лифты",
      "Адаптированные туалеты",
      "Специальные парковочные места",
    ].slice(0, Math.floor(Math.random() * 4)),
    improvementProjects: 2 + Math.floor(Math.random() * 6),
    greenSpaces: 3 + Math.floor(Math.random() * 8),
  };

  return {
    school,
    qualityKnowledge,
    resultsDynamics,
    talentDevelopment,
    teacherQualification,
    teacherAchievements,
    schoolEquipment,
    internationalRelations,
    schoolSafety,
    educationalWork,
    inclusionAndImprovement,
  };
};
