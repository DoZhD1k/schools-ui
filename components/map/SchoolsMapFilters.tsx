"use client";

import { useState } from "react";
import { MapFilters } from "@/types/schools-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Filter,
  X,
  BarChart3,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SchoolsMapFiltersProps {
  filters: MapFilters;
  filterOptions: {
    districts: string[];
    educationTypes: string[];
  };
  statistics: {
    total: number;
    privateSchools: number;
    publicSchools: number;
    avgRating: number;
    overloadedSchools: number;
    balancedSchools: number;
    underloadedSchools: number;
  };
  onFiltersChange: (filters: MapFilters) => void;
  onReset: () => void;
}

export default function SchoolsMapFilters({
  filters,
  filterOptions,
  statistics,
  onFiltersChange,
  onReset,
}: SchoolsMapFiltersProps) {
  const [isOpen, setIsOpen] = useState(true); // Открываем фильтры по умолчанию
  const [collapsedSections, setCollapsedSections] = useState({
    districts: false,
    ownershipType: false,
    educationType: false,
    loadStatus: false,
    rating: false,
  });

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  console.log("SchoolsMapFilters render:", {
    filters,
    filterOptions,
    districts: filterOptions.districts.length,
    educationTypes: filterOptions.educationTypes.length,
  });

  const updateFilter = (
    key: keyof MapFilters,
    value: string[] | boolean | null | [number, number] | string
  ) => {
    console.log("updateFilter called:", { key, value });
    const newFilters = { ...filters, [key]: value };
    console.log("newFilters:", newFilters);
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof MapFilters];
    if (key === "searchQuery") {
      return typeof value === "string" && value.trim().length > 0;
    }
    return Array.isArray(value)
      ? value.length > 0
      : value !== null && value !== undefined;
  });

  return (
    <div className="absolute top-4 left-4 z-10 w-80">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Фильтры и статистика
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-blue-50 p-2 rounded">
              <div className="font-semibold text-blue-900">Всего школ</div>
              <div className="text-xl font-bold text-blue-700">
                {statistics.total}
              </div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="font-semibold text-green-900">Ср. рейтинг</div>
              <div className="text-xl font-bold text-green-700">
                {statistics.avgRating}
              </div>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <div className="font-semibold text-purple-900">Частные</div>
              <div className="text-xl font-bold text-purple-700">
                {statistics.privateSchools}
              </div>
            </div>
            <div className="bg-orange-50 p-2 rounded">
              <div className="font-semibold text-orange-900">
                Государственные
              </div>
              <div className="text-xl font-bold text-orange-700">
                {statistics.publicSchools}
              </div>
            </div>
          </div>

          {/* Search - всегда видимый */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center">
              <Search className="h-4 w-4 mr-2" />
              Поиск школ
            </Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Название школы, район или адрес..."
                value={filters.searchQuery || ""}
                onChange={(e) => updateFilter("searchQuery", e.target.value)}
                className="flex-1"
              />
              {filters.searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilter("searchQuery", "")}
                  className="px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {filters.searchQuery && (
              <div className="text-xs text-gray-500">
                Найдено школ: {statistics.total}
              </div>
            )}
          </div>

          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleContent className="space-y-4">
              {/* Type of ownership */}
              <Collapsible
                open={!collapsedSections.ownershipType}
                onOpenChange={() => toggleSection("ownershipType")}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto font-medium text-sm"
                  >
                    <span>Тип собственности</span>
                    {collapsedSections.ownershipType ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="all-ownership"
                        checked={
                          filters.isPrivate === null ||
                          filters.isPrivate === undefined
                        }
                        onCheckedChange={(checked) => {
                          if (checked) updateFilter("isPrivate", null);
                        }}
                      />
                      <Label htmlFor="all-ownership" className="text-sm">
                        Все
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="private"
                        checked={filters.isPrivate === true}
                        onCheckedChange={(checked) => {
                          updateFilter("isPrivate", checked ? true : null);
                        }}
                      />
                      <Label htmlFor="private" className="text-sm">
                        Частные
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="public"
                        checked={filters.isPrivate === false}
                        onCheckedChange={(checked) => {
                          updateFilter("isPrivate", checked ? false : null);
                        }}
                      />
                      <Label htmlFor="public" className="text-sm">
                        Государственные
                      </Label>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Districts */}
              <Collapsible
                open={!collapsedSections.districts}
                onOpenChange={() => toggleSection("districts")}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto font-medium text-sm"
                  >
                    <span>Районы ({filterOptions.districts.length})</span>
                    {collapsedSections.districts ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filterOptions.districts.map((district) => (
                      <div
                        key={district}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`district-${district}`}
                          checked={
                            filters.district?.includes(district) || false
                          }
                          onCheckedChange={(checked) => {
                            const currentDistricts = filters.district || [];
                            if (checked) {
                              updateFilter("district", [
                                ...currentDistricts,
                                district,
                              ]);
                            } else {
                              updateFilter(
                                "district",
                                currentDistricts.filter((d) => d !== district)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`district-${district}`}
                          className="text-sm truncate"
                        >
                          {district}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Education Types */}
              <Collapsible
                open={!collapsedSections.educationType}
                onOpenChange={() => toggleSection("educationType")}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto font-medium text-sm"
                  >
                    <span>
                      Типы образования ({filterOptions.educationTypes.length})
                    </span>
                    {collapsedSections.educationType ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {filterOptions.educationTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={
                            filters.educationType?.includes(type) || false
                          }
                          onCheckedChange={(checked) => {
                            const currentTypes = filters.educationType || [];
                            if (checked) {
                              updateFilter("educationType", [
                                ...currentTypes,
                                type,
                              ]);
                            } else {
                              updateFilter(
                                "educationType",
                                currentTypes.filter((t) => t !== type)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`type-${type}`}
                          className="text-sm truncate"
                        >
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Overload Status */}
              <Collapsible
                open={!collapsedSections.loadStatus}
                onOpenChange={() => toggleSection("loadStatus")}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto font-medium text-sm"
                  >
                    <span>Статус загруженности</span>
                    {collapsedSections.loadStatus ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  <div className="space-y-1">
                    {[
                      { key: "balanced", label: "Сбалансирована" },
                      { key: "overloaded", label: "Перегружена" },
                      { key: "underloaded", label: "Недозагружена" },
                    ].map((status) => (
                      <div
                        key={status.key}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`status-${status.key}`}
                          checked={
                            filters.overloadStatus?.includes(status.key) ||
                            false
                          }
                          onCheckedChange={(checked) => {
                            const currentStatuses =
                              filters.overloadStatus || [];
                            if (checked) {
                              updateFilter("overloadStatus", [
                                ...currentStatuses,
                                status.key,
                              ]);
                            } else {
                              updateFilter(
                                "overloadStatus",
                                currentStatuses.filter((s) => s !== status.key)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`status-${status.key}`}
                          className="text-sm"
                        >
                          {status.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Reset Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Сбросить фильтры
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  );
}
