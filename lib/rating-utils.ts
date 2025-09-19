import { School, RatingWeights } from "@/types/schools";

// Утилиты для работы с рейтингами школ

export const RATING_ZONES = {
  green: { min: 86, max: 100, label: "Зеленая зона", color: "#22c55e" },
  yellow: { min: 50, max: 85, label: "Желтая зона", color: "#eab308" },
  red: { min: 5, max: 49, label: "Красная зона", color: "#ef4444" },
} as const;

export function getRatingZone(rating: number): "green" | "yellow" | "red" {
  if (rating >= RATING_ZONES.green.min) return "green";
  if (rating >= RATING_ZONES.yellow.min) return "yellow";
  return "red";
}

export function getRatingZoneColor(zone: "green" | "yellow" | "red"): string {
  return RATING_ZONES[zone].color;
}

export function getRatingZoneLabel(zone: "green" | "yellow" | "red"): string {
  return RATING_ZONES[zone].label;
}

export function calculateRating(
  indicators: School["indicators"],
  weights: RatingWeights
): number {
  const totalWeight = Object.values(weights).reduce(
    (sum, weight) => sum + weight,
    0
  );

  if (totalWeight === 0) return 0;

  const weightedSum =
    indicators.K * weights.K +
    indicators.C * weights.C +
    indicators.T * weights.T +
    indicators.P * weights.P +
    indicators.O * weights.O +
    indicators.A * weights.A +
    indicators.B * weights.B +
    indicators.M * weights.M +
    indicators.V * weights.V +
    indicators.I * weights.I;

  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

export function validateWeights(weights: RatingWeights): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const totalWeight = Object.values(weights).reduce(
    (sum, weight) => sum + weight,
    0
  );

  // Проверка на отрицательные значения
  Object.entries(weights).forEach(([key, value]) => {
    if (value < 0) {
      errors.push(`Вес ${key} не может быть отрицательным`);
    }
    if (value > 100) {
      errors.push(`Вес ${key} не может превышать 100`);
    }
  });

  // Проверка общей суммы весов
  if (totalWeight !== 100) {
    errors.push(
      `Общая сумма весов должна равняться 100 (текущая: ${totalWeight})`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function formatRatingTrend(
  current: number,
  previous: number
): {
  trend: "up" | "down" | "stable";
  change: number;
  formatted: string;
} {
  const change = current - previous;
  let trend: "up" | "down" | "stable";

  if (Math.abs(change) < 0.5) {
    trend = "stable";
  } else if (change > 0) {
    trend = "up";
  } else {
    trend = "down";
  }

  const formatted = change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);

  return { trend, change, formatted };
}

export function getIndicatorLabel(
  indicator: keyof School["indicators"]
): string {
  const labels = {
    K: "Качество знаний",
    C: "Динамика результатов",
    T: "Развитие талантов",
    P: "Квалификация педагогов",
    O: "Достижения педагогов",
    A: "Оснащенность школы",
    B: "Международные отношения",
    M: "Безопасность",
    V: "Воспитательная работа",
    I: "Инклюзия и благоустройство",
  };

  return labels[indicator];
}

export function generateExcelData<T extends Record<string, unknown>>(
  data: T[],
  filename: string
): { data: T[]; filename: string; timestamp: string } {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  const timestampedFilename = `${filename}_${timestamp}.xlsx`;

  return {
    data,
    filename: timestampedFilename,
    timestamp,
  };
}

export function sortSchools(
  schools: School[],
  sortBy: keyof School | keyof School["indicators"] | "district",
  sortOrder: "asc" | "desc" = "desc"
): School[] {
  return [...schools].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortBy === "district") {
      aValue = a.district.nameRu;
      bValue = b.district.nameRu;
    } else if (sortBy in a.indicators) {
      aValue = a.indicators[sortBy as keyof School["indicators"]];
      bValue = b.indicators[sortBy as keyof School["indicators"]];
    } else {
      aValue = a[sortBy as keyof School] as string | number;
      bValue = b[sortBy as keyof School] as string | number;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue, "ru")
        : bValue.localeCompare(aValue, "ru");
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });
}

export function filterSchoolsByRatingRange(
  schools: School[],
  min: number,
  max: number
): School[] {
  return schools.filter(
    (school) => school.currentRating >= min && school.currentRating <= max
  );
}

export function groupSchoolsByDistrict(
  schools: School[]
): Record<string, School[]> {
  return schools.reduce((groups, school) => {
    const districtName = school.district.nameRu;
    if (!groups[districtName]) {
      groups[districtName] = [];
    }
    groups[districtName].push(school);
    return groups;
  }, {} as Record<string, School[]>);
}

export function getSchoolsInRadius(
  schools: School[],
  centerLat: number,
  centerLng: number,
  radiusKm: number
): School[] {
  return schools.filter((school) => {
    if (!school.coordinates) return false;

    const distance = calculateDistance(
      centerLat,
      centerLng,
      school.coordinates.lat,
      school.coordinates.lng
    );

    return distance <= radiusKm;
  });
}

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Радиус Земли в км
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
