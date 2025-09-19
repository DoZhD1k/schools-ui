// Список коллекций
export interface CollectionList {
  id: number;
  name: string;
  description: string;
  srid: number;
  created_at: string;
  updated_at: string;
  user_id: number;
}

// Список пользователей
export interface userList {
  id: number;
  username: string;
  role: string;
  isActive: boolean;
}

// Параметры регистрации нового пользователя
export interface registerUser {
  username: string;
  password: string;
  email: string;
  role: string;
}

// Параметры загрузки GeoJSON-файла
export interface uploadGeojson {
  name: string;
  description: string;
  file: File;
}

// Общие геометрические типы
export type Position = [number, number];
export type MultiPolygonCoordinates = Position[][][];
export interface MultiPolygonGeometry {
  type: "MultiPolygon";
  coordinates: MultiPolygonCoordinates;
}

// Свойства гео-объекта
export interface FeatureProperties {
  name: string;
  nameRu: string;
  area_m2: number;
  grid_id: number;
  area_km2: number;
  population: number;
  crimes_count: number;
  cameras_count: number;
  company_count: number;
  // Метрики, которые могут быть null
  crimes_per_camera: number | null;
  crimes_per_company: number | null;
  people_per_company: number | null;
  cameras_per_company: number | null;
  // Плотности и относительные показатели
  camera_density_per_km2: number;
  crimes_density_per_km2: number;
  crimes_per_1000_people: number;
  density_people_per_km2: number;
  cameras_per_1000_people: number;
  company_density_per_km2: number;
  companies_per_1000_people: number;
}

// Запрос на добавление нового объекта
export interface AddFeatureRequest {
  properties: FeatureProperties;
  geometry: MultiPolygonGeometry;
}

// Запрос на обновление существующего объекта:
// • properties опциональны, можно менять любые поля
// • geometry опциональна — если указана, обновит всю геометрию
export interface UpdateFeatureRequest {
  properties?: Partial<FeatureProperties>;
  geometry?: MultiPolygonGeometry;
}

// Альтернативный упрощённый вариант для обновления:
// export type UpdateFeatureRequest2 = Partial<AddFeatureRequest>;
