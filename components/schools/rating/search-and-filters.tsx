"use client";

import React from "react";
import { Search, List, Grid3X3, MapPin, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  viewMode: "cards" | "table";
  setViewMode: (mode: "cards" | "table") => void;
  onExport: () => void;
}

export const SearchAndFilters = ({
  searchTerm,
  setSearchTerm,
  selectedDistrict,
  setSelectedDistrict,
  viewMode,
  setViewMode,
  onExport,
}: SearchAndFiltersProps) => {
  const districts = [
    { id: "alatausky", name: "Алатауский район" },
    { id: "almalinsky", name: "Алмалинский район" },
    { id: "zhetysusky", name: "Ауэзовский район" },
    { id: "bostandyksky", name: "Бостандыкский район" },
    { id: "zhetysusky", name: "Жетысуский район" },
    { id: "medeusky", name: "Медеуский район" },
    { id: "zhetysusky", name: "Наурызбайский район" },
    { id: "turksibsky", name: "Турксибский район" },
  ];

  return (
    <div className="mb-8">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md rounded-3xl border border-[hsl(0_0%_100%_/_0.2)]"></div>
        <div className="absolute inset-0 rounded-3xl shadow-lg"></div>
        <div className="relative p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-600 z-10" />
                <Input
                  placeholder="Поиск по названию школы, району или директору..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] focus:bg-white/80 text-slate-700"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-white/50 backdrop-blur-sm rounded-xl border border-[hsl(0_0%_100%_/_0.2)] p-1">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className={`h-8 px-3 ${
                    viewMode === "table"
                      ? "bg-white shadow-sm text-slate-700"
                      : "text-slate-600 hover:text-slate-700"
                  }`}
                >
                  <List className="h-4 w-4 mr-1" />
                  Таблица
                </Button>
                <Button
                  variant={viewMode === "cards" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("cards")}
                  className={`h-8 px-3 ${
                    viewMode === "cards"
                      ? "bg-white shadow-sm text-slate-700"
                      : "text-slate-600 hover:text-slate-700"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4 mr-1" />
                  Карточки
                </Button>
              </div>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
              >
                <SelectTrigger className="w-48 bg-white/50 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] focus:bg-white/80">
                  <div className="flex items-center gap-1 text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <SelectValue placeholder="Все районы" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все районы</SelectItem>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.name}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={onExport}
                className="bg-white/80 backdrop-blur-sm border-[hsl(0_0%_100%_/_0.2)] text-slate-700 hover:bg-white/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
