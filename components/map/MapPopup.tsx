import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Info,
  Users,
  MapPin,
  Home,
  Camera,
  Briefcase,
  AlertTriangle,
} from "lucide-react";
import type { EnrichedGridProperties } from "@/types/geojson";

// Helper function to format numbers
const formatNumber = (num: number, digits = 0): string => {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(num);
};

interface MapPopupContentProps {
  properties: EnrichedGridProperties;
  activeMetric: keyof EnrichedGridProperties;
}

export function MapPopupContent({
  properties,
  activeMetric,
}: MapPopupContentProps) {
  // Find metric name and format its value
  const metricLabel = activeMetric.replace(/_/g, " ");
  const metricValue = properties[activeMetric];
  const formattedValue =
    typeof metricValue === "number"
      ? formatNumber(metricValue, metricValue < 10 ? 2 : 0)
      : String(metricValue || 0);

  // Prepare common metrics to show
  const commonMetrics = [
    {
      label: "Population",
      value: formatNumber(properties.population),
      color: "var(--chart-1)",
      icon: <Users className="h-3 w-3" />,
    },
    {
      label: "Area",
      value: `${formatNumber(properties.area_km2, 2)} km²`,
      color: "var(--chart-2)",
      icon: <MapPin className="h-3 w-3" />,
    },
    {
      label: "Density",
      value: `${formatNumber(properties.density_people_per_km2)}/km²`,
      color: "var(--chart-3)",
      icon: <Home className="h-3 w-3" />,
    },
  ];

  return (
    <Card className="border-none shadow-lg w-72">
      <CardHeader className="py-4 px-4 bg-background border-b">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="truncate font-medium">
            {properties.nameRu || properties.name || "Area"}
          </span>
          <Badge variant="outline" className="ml-2 text-xs font-normal">
            ID: {properties.grid_id}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4 bg-background">
        {/* Highlighted active metric */}
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {metricLabel}
          </div>
          <div className="text-xl font-medium">{formattedValue}</div>
        </div>

        <Separator className="my-1" />

        {/* Common metrics grid */}
        <div className="grid grid-cols-3 gap-3">
          {commonMetrics.map((metric) => (
            <div key={metric.label} className="text-left">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1 mb-1">
                {metric.icon}
                {metric.label}
              </div>
              <div
                className="text-sm font-medium"
                style={{ color: metric.color }}
              >
                {metric.value}
              </div>
            </div>
          ))}
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs pt-1">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Crimes
            </span>
            <span className="font-medium">
              {formatNumber(properties.crimes_count)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Camera className="h-3 w-3" />
              Cameras
            </span>
            <span className="font-medium">
              {formatNumber(properties.cameras_count)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              Companies
            </span>
            <span className="font-medium">
              {formatNumber(properties.company_count)}
            </span>
          </div>
          <TooltipProvider>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground uppercase tracking-wide flex items-center">
                Crimes/1K
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 ml-1 cursor-help opacity-70" />
                  </TooltipTrigger>
                  <TooltipContent>Crimes per 1000 people</TooltipContent>
                </Tooltip>
              </span>
              <span className="font-medium">
                {formatNumber(properties.crimes_per_1000_people, 1)}
              </span>
            </div>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

export function createPopupHtml(props: MapPopupContentProps): string {
  const { properties, activeMetric } = props;
  const metricLabel = activeMetric.replace(/_/g, " ");
  const metricValue = properties[activeMetric];
  const formattedValue =
    typeof metricValue === "number"
      ? formatNumber(metricValue, metricValue < 10 ? 2 : 0)
      : String(metricValue || 0);

  const icons = {
    users:
      '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    map: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    home: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  };

  return `
    <div class="shadow-lg bg-background rounded-md overflow-hidden" style="width: 240px; border: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div class="py-3 px-4 border-b" style="color: var(--foreground);">
        <div class="text-sm font-medium overflow-hidden text-ellipsis" style="max-width: 200px;">
          ${properties.nameRu || properties.name || "Area"}
        </div>
      </div>
      <div class="p-4">
        <div class="mb-3">
          <div class="text-xs uppercase tracking-wide" style="color: var(--muted-foreground); margin-bottom: 2px;">
            ${metricLabel}
          </div>
          <div class="text-lg font-medium">
            ${formattedValue}
          </div>
        </div>
        
        <div style="height: 1px; background-color: var(--border); margin: 12px 0;"></div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px;">
          <div>
            <div style="display: flex; align-items: center; gap: 4px; font-size: 10px; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 2px;">
              ${icons.users} Population
            </div>
            <div style="font-size: 14px; font-weight: 500; color: var(--chart-1);">${formatNumber(
              properties.population
            )}</div>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 4px; font-size: 10px; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 2px;">
              ${icons.map} Area
            </div>
            <div style="font-size: 14px; font-weight: 500; color: var(--chart-2);">${formatNumber(
              properties.area_km2,
              2
            )} km²</div>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 4px; font-size: 10px; text-transform: uppercase; color: var(--muted-foreground); margin-bottom: 2px;">
              ${icons.home} Density
            </div>
            <div style="font-size: 14px; font-weight: 500; color: var(--chart-3);">${formatNumber(
              properties.density_people_per_km2
            )}/km²</div>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; column-gap: 16px; row-gap: 8px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em;">Crimes:</span>
            <span style="font-weight: 500;">${formatNumber(
              properties.crimes_count
            )}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em;">Cameras:</span>
            <span style="font-weight: 500;">${formatNumber(
              properties.cameras_count
            )}</span>
          </div>
        </div>
      </div>
    </div>
    `;
}
