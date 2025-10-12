// Типы для API школ
export interface SchoolInfra {
  origin_marker: {
    type: "Point";
    coordinates: [number, number];
  };
  origin_geom: {
    type: "MultiPolygon";
    coordinates: [number, number][][][];
  };
}

export interface SchoolProperties {
  id: number;
  infra: SchoolInfra | null;
  region: string;
  district: string;
  name_of_the_organization: string;
  types_of_educational_institutions: string;
  form_of_ownership: string;
  departmental_affiliation: string;
  contingency_filter: number;
  group_of_school: string;
  is_closed_sign: boolean;
  gis_rating: number | null;
}

// Типы для balance-enriched API (полигоны районов)
export interface BalanceEnrichedItem {
  id: number;
  bilingual: string; // номер школы
  kazakh: string; // номер школы
  russian: string; // номер школы
  uyghur: string; // номер школы
  // другие поля из API
  [key: string]: any;
}

export interface DistrictPolygon {
  id: number;
  type: "Feature";
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: any;
  };
  properties: BalanceEnrichedItem;
}

export interface SchoolLanguageMapping {
  schoolNumber: string;
  language: "bilingual" | "kazakh" | "russian" | "uyghur";
  schoolInfo?: SchoolProperties;
  districtPolygons: DistrictPolygon[];
}

export interface SchoolFeature {
  id: number;
  type: "Feature";
  geometry: {
    type: "Point" | "MultiPolygon";
    coordinates: [number, number] | [number, number][][][];
  };
  properties: SchoolProperties;
}

export interface SchoolsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SchoolProperties[];
}

export interface MapFilters {
  searchQuery?: string;
  educationType?: string[];
  isPrivate?: boolean | null;
  district?: string[];
  overloadStatus?: string[];
  ratingRange?: [number, number];
  capacityRange?: [number, number];
  // Новые фильтры для языков и школ
  selectedSchool?: string; // номер школы
  selectedLanguage?: "bilingual" | "kazakh" | "russian" | "uyghur" | null;
  schoolSearchQuery?: string; // поиск по названию школы
}

export interface MapState {
  schools: SchoolFeature[];
  filteredSchools: SchoolFeature[];
  balanceData: BalanceEnrichedItem[];
  districtPolygons: DistrictPolygon[];
  schoolLanguageMappings: SchoolLanguageMapping[];
  filteredPolygons: DistrictPolygon[];
  filters: MapFilters;
  loading: boolean;
  error: string | null;
  selectedSchool: SchoolFeature | null;
}
