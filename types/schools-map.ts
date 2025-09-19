// Типы для API школ
export interface SchoolFeature {
  id: number;
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    organization_name: string;
    note_from_list: string | null;
    micro_district: string | null;
    district: string | null;
    rating: number | null;
    education_type: string | null;
    is_private: boolean;
    language: string | null;
    shifts: number | null;
    building_year: number | null;
    commissioning_year: number | null;
    capacity: number | null;
    second_building_year: number | null;
    second_commissioning_year: number | null;
    second_capacity: number | null;
    third_building_year: number | null;
    third_commissioning_year: number | null;
    third_capacity: number | null;
    total_capacity: number | null;
    actual_students: number | null;
    shift_coefficient: number | null;
    second_shift_coefficient: number | null;
    third_shift_coefficient: number | null;
    designed_for: number | null;
    forecast_grade_10: number | null;
    forecast_grade_1: number | null;
    forecast_total: number | null;
    delta: number | null;
    overload_status: "balanced" | "overloaded" | "underloaded" | null;
    zero_class: number | null;
    class_1: number | null;
    class_2: number | null;
    class_3: number | null;
    class_4: number | null;
    class_5: number | null;
    class_6: number | null;
    class_7: number | null;
    class_8: number | null;
    class_9: number | null;
    class_10: number | null;
    class_11: number | null;
    class_12: number | null;
    class_13: number | null;
    short_key: string | null;
    point_id: number | null;
    capacity_shifts: number | null;
    total_2024: number;
    capacity_with_shifts: number | null;
    deficit: number;
    surplus: number;
    circle_color: string;
    circle_radius: number;
    gov_share: number | null;
    forecast_2026: number | null;
    forecast_2027: number | null;
    forecast_2028: number | null;
    forecast_2029: number | null;
    forecast_2030: number | null;
    status_2026: "balanced" | "overloaded" | "underloaded" | null;
    status_2027: "balanced" | "overloaded" | "underloaded" | null;
    status_2028: "balanced" | "overloaded" | "underloaded" | null;
    status_2029: "balanced" | "overloaded" | "underloaded" | null;
    status_2030: "balanced" | "overloaded" | "underloaded" | null;
    school_number: string | null;
    "Unnamed: 0": number;
  };
}

export interface SchoolsApiResponse {
  type: "FeatureCollection";
  name: string;
  crs: {
    type: "name";
    properties: {
      name: string;
    };
  };
  count: number;
  next: string | null;
  previous: string | null;
  features: SchoolFeature[];
}

export interface MapFilters {
  searchQuery?: string;
  educationType?: string[];
  isPrivate?: boolean | null;
  district?: string[];
  overloadStatus?: string[];
  ratingRange?: [number, number];
  capacityRange?: [number, number];
}

export interface MapState {
  schools: SchoolFeature[];
  filteredSchools: SchoolFeature[];
  filters: MapFilters;
  loading: boolean;
  error: string | null;
  selectedSchool: SchoolFeature | null;
}
