"use client";

import React from "react";
import { useMapContext } from "@/contexts/map-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Settings, Filter } from "lucide-react";

export default function PolygonControls() {
  const {
    showPolygons,
    setShowPolygons,
    polygonFilters,
    setPolygonFilters,
    polygonStyleConfig,
    setPolygonStyleConfig,
    polygons,
  } = useMapContext();

  const handleFilterChange = (
    key: keyof typeof polygonFilters,
    value: unknown
  ) => {
    setPolygonFilters({
      ...polygonFilters,
      [key]: value,
    });
  };

  const handleStyleChange = (
    key: keyof typeof polygonStyleConfig,
    value: unknown
  ) => {
    setPolygonStyleConfig({
      ...polygonStyleConfig,
      [key]: value,
    });
  };

  const resetFilters = () => {
    setPolygonFilters({
      status: "all",
      year: undefined, // Убираем дефолтный год
    });
  };

  const getFilteredCount = () => {
    if (!polygons.length) return 0;

    return polygons.filter((polygon) => {
      const props = polygon.properties;

      if (polygonFilters.year && props.year !== polygonFilters.year)
        return false;
      if (
        polygonFilters.status &&
        polygonFilters.status !== "all" &&
        props.status !== polygonFilters.status
      )
        return false;
      if (
        polygonFilters.minCapacity &&
        props.capacity_with_shifts_weighted < polygonFilters.minCapacity
      )
        return false;
      if (
        polygonFilters.maxCapacity &&
        props.capacity_with_shifts_weighted > polygonFilters.maxCapacity
      )
        return false;
      if (
        polygonFilters.minDemand &&
        props.demand_public_6_17 < polygonFilters.minDemand
      )
        return false;
      if (
        polygonFilters.maxDemand &&
        props.demand_public_6_17 > polygonFilters.maxDemand
      )
        return false;

      return true;
    }).length;
  };

  const getTotalStats = () => {
    if (!polygons.length) return { surplus: 0, deficit: 0 };

    return polygons.reduce(
      (acc, polygon) => {
        if (polygon.properties.status === "surplus") {
          acc.surplus++;
        } else {
          acc.deficit++;
        }
        return acc;
      },
      { surplus: 0, deficit: 0 }
    );
  };

  const stats = getTotalStats();
  const filteredCount = getFilteredCount();

  return (
    <Card className="w-80 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5" />
          Управление полигонами
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Toggle Visibility */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="show-polygons" className="text-sm font-medium">
              Показать полигоны
            </Label>
            <Switch
              id="show-polygons"
              checked={showPolygons}
              onCheckedChange={setShowPolygons}
            />
          </div>

          {showPolygons && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              Показано {filteredCount} из {polygons.length} полигонов
            </div>
          )}

          {!showPolygons && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <EyeOff className="h-4 w-4" />
              Полигоны скрыты
            </div>
          )}
        </div>

        {showPolygons && (
          <>
            <Separator />

            {/* Statistics */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Статистика
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-700">
                    {stats.surplus}
                  </div>
                  <div className="text-xs text-green-600">Избыток</div>
                </div>
                <div className="text-center p-2 bg-red-50 rounded-lg">
                  <div className="text-lg font-semibold text-red-700">
                    {stats.deficit}
                  </div>
                  <div className="text-xs text-red-600">Дефицит</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Filters */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Фильтры</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs"
                >
                  Сбросить
                </Button>
              </div>

              {/* Year Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Год</Label>
                <Select
                  value={polygonFilters.year?.toString() || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "year",
                      value === "all" ? undefined : parseInt(value)
                    )
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Выберите год" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все годы</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-xs">Статус</Label>
                <Select
                  value={polygonFilters.status}
                  onValueChange={(value: "all" | "surplus" | "deficit") =>
                    handleFilterChange("status", value)
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="surplus">Избыток</SelectItem>
                    <SelectItem value="deficit">Дефицит</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Capacity Range */}
              <div className="space-y-2">
                <Label className="text-xs">Вместимость</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="От"
                      className="flex-1 h-8 px-2 text-xs border rounded"
                      value={polygonFilters.minCapacity || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "minCapacity",
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                    <input
                      type="number"
                      placeholder="До"
                      className="flex-1 h-8 px-2 text-xs border rounded"
                      value={polygonFilters.maxCapacity || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "maxCapacity",
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Demand Range */}
              <div className="space-y-2">
                <Label className="text-xs">Потребность</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="От"
                      className="flex-1 h-8 px-2 text-xs border rounded"
                      value={polygonFilters.minDemand || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "minDemand",
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                    <input
                      type="number"
                      placeholder="До"
                      className="flex-1 h-8 px-2 text-xs border rounded"
                      value={polygonFilters.maxDemand || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "maxDemand",
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Style Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Настройки отображения</h4>

              {/* Opacity */}
              <div className="space-y-2">
                <Label className="text-xs">Прозрачность</Label>
                <Slider
                  value={[polygonStyleConfig.opacity]}
                  onValueChange={([value]) =>
                    handleStyleChange("opacity", value)
                  }
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {Math.round(polygonStyleConfig.opacity * 100)}%
                </div>
              </div>

              {/* Stroke Width */}
              <div className="space-y-2">
                <Label className="text-xs">Толщина границ</Label>
                <Slider
                  value={[polygonStyleConfig.strokeWidth]}
                  onValueChange={([value]) =>
                    handleStyleChange("strokeWidth", value)
                  }
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {polygonStyleConfig.strokeWidth}px
                </div>
              </div>

              {/* Color Configuration */}
              <div className="space-y-3">
                <Label className="text-xs">Цвета</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Избыток
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={polygonStyleConfig.surplusColor}
                        onChange={(e) =>
                          handleStyleChange("surplusColor", e.target.value)
                        }
                        className="w-8 h-8 rounded border"
                        title="Выберите цвет для избытка"
                        aria-label="Цвет для избытка мест"
                      />
                      <Badge variant="outline" className="text-xs">
                        {polygonStyleConfig.surplusColor}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Дефицит
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={polygonStyleConfig.deficitColor}
                        onChange={(e) =>
                          handleStyleChange("deficitColor", e.target.value)
                        }
                        className="w-8 h-8 rounded border"
                        title="Выберите цвет для дефицита"
                        aria-label="Цвет для дефицита мест"
                      />
                      <Badge variant="outline" className="text-xs">
                        {polygonStyleConfig.deficitColor}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
