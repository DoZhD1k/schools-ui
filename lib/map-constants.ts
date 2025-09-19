import type { EnrichedGridProperties } from "@/types/geojson";

// Define FilterRange interface
export interface FilterRange {
  min: number;
  max: number;
}

export const metricOptions = [
  { value: "population", label: "Population", maxDefault: 10000 },
  {
    value: "density_people_per_km2",
    label: "Population Density",
    maxDefault: 5000,
  },
  { value: "crimes_count", label: "Crimes Count", maxDefault: 1000 },
  { value: "crimes_density_per_km2", label: "Crimes Density", maxDefault: 500 },
  {
    value: "crimes_per_1000_people",
    label: "Crimes per 1000 People",
    maxDefault: 100,
  },
  { value: "cameras_count", label: "Cameras Count", maxDefault: 500 },
  { value: "camera_density_per_km2", label: "Camera Density", maxDefault: 200 },
  { value: "crimes_per_camera", label: "Crimes per Camera", maxDefault: 50 },
  {
    value: "cameras_per_1000_people",
    label: "Cameras per 1000 People",
    maxDefault: 100,
  },
  { value: "company_count", label: "Companies Count", maxDefault: 2000 },
  {
    value: "company_density_per_km2",
    label: "Company Density",
    maxDefault: 1000,
  },
  {
    value: "companies_per_1000_people",
    label: "Companies per 1000 People",
    maxDefault: 200,
  },
  { value: "crimes_per_company", label: "Crimes per Company", maxDefault: 50 },
  {
    value: "people_per_company",
    label: "People per Company",
    maxDefault: 1000,
  },
  {
    value: "cameras_per_company",
    label: "Cameras per Company",
    maxDefault: 20,
  },
];

export const getMetricDefaultRange = (
  metric: keyof EnrichedGridProperties
): FilterRange => {
  const metricInfo = metricOptions.find((m) => m.value === metric);
  return {
    min: 0,
    max: metricInfo?.maxDefault || 10000,
  };
};
