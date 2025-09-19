"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, X } from "lucide-react";
import { useMapContext } from "@/contexts/map-context";
import MapLegend from "./MapLegend";
import { metricOptions } from "@/lib/map-constants";
import type { EnrichedGridProperties } from "@/types/geojson";
import { getDictionary } from "@/get-dictionary";
import type { Locale } from "@/i18n-config";

export default function MapControls() {
  const [isOpen, setIsOpen] = useState(true);
  const [dictionary, setDictionary] = useState<any>(null);
  const params = useParams();

  const {
    activeMetric,
    setActiveMetric,
    visibleLayers,
    setVisibleLayers,
    filterRange,
    setFilterRange,
    setColorScheme,
    metricMaxValues,
    resetFilters,
  } = useMapContext();

  // Загрузка словаря при монтировании компонента
  useEffect(() => {
    async function loadDictionary() {
      if (params?.lang) {
        const dict = await getDictionary(params.lang as Locale);
        setDictionary(dict);
      }
    }

    loadDictionary();
  }, [params?.lang]);

  const currentMaxValue = metricMaxValues[activeMetric] || 10000;

  const togglePanel = () => setIsOpen(!isOpen);

  const handleMetricChange = (value: string) => {
    const isValidMetricKey = (
      key: string
    ): key is keyof EnrichedGridProperties => {
      return metricOptions.some((option) => option.value === key);
    };

    if (isValidMetricKey(value)) {
      setActiveMetric(value);
    }
  };

  const handleLayerToggle = (layer: string) => {
    const newLayers = visibleLayers.includes(layer)
      ? visibleLayers.filter((l) => l !== layer)
      : [...visibleLayers, layer];

    setVisibleLayers(newLayers);
  };

  const handleColorSchemeSelect = (scheme: string) => {
    const colorSchemes = {
      classic: ["#3498db", "#2ecc71", "#f1c40f", "#e67e22", "#e74c3c"],
      viridis: ["#440154", "#3b528b", "#21908d", "#5dc963", "#fde725"],
      plasma: ["#0d0887", "#7e03a8", "#cc4778", "#f89540", "#f0f921"],
      magma: ["#000004", "#51127c", "#b63679", "#fb8861", "#fcfdbf"],
      inferno: ["#000004", "#57106e", "#bc3754", "#f98c0a", "#fcffa4"],
    };

    setColorScheme(colorSchemes[scheme as keyof typeof colorSchemes]);
  };

  // Если словарь еще не загружен, показываем компонент без локализации
  if (!dictionary) return null;

  return (
    <div
      className={`absolute top-4 ${
        isOpen ? "left-4" : "-left-2"
      } transition-all duration-300 z-10`}
    >
      {isOpen ? (
        <Card className="w-80 shadow-lg border-0">
          <CardHeader className="pb-2 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base uppercase tracking-wide font-medium">
                {dictionary.map.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePanel}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs defaultValue="metrics" className="w-full">
              <TabsList className="w-full mb-6 grid grid-cols-3 gap-1">
                <TabsTrigger
                  value="metrics"
                  className="uppercase text-xs tracking-wide"
                >
                  {dictionary.map.filters.metrics}
                </TabsTrigger>
                <TabsTrigger
                  value="layers"
                  className="uppercase text-xs tracking-wide"
                >
                  {dictionary.map.filters.layers}
                </TabsTrigger>
                <TabsTrigger
                  value="style"
                  className="uppercase text-xs tracking-wide"
                >
                  {dictionary.map.filters.visualization}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="metrics">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="metric-select"
                      className="text-xs uppercase tracking-wide"
                    >
                      {dictionary.map.filters.metrics}
                    </Label>
                    <Select
                      value={activeMetric}
                      onValueChange={handleMetricChange}
                    >
                      <SelectTrigger id="metric-select" className="h-9">
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        {metricOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Accordion
                    type="single"
                    collapsible
                    defaultValue="filter"
                    className="border-b pb-4"
                  >
                    <AccordionItem value="filter" className="border-0">
                      <AccordionTrigger className="py-2 text-xs uppercase tracking-wide font-medium">
                        Filter Range: {filterRange.min} - {filterRange.max}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-6 pt-2">
                          <Slider
                            value={[filterRange.min, filterRange.max]}
                            min={0}
                            max={currentMaxValue}
                            step={Math.max(
                              1,
                              Math.floor(currentMaxValue / 100)
                            )}
                            onValueChange={(values) => {
                              setFilterRange({
                                min: values[0],
                                max: values[1],
                              });
                            }}
                            className="mt-6"
                          />
                          <div className="flex justify-between text-xs">
                            <div className="flex flex-col items-center">
                              <label
                                className="text-muted-foreground mb-1 uppercase text-[10px] tracking-wide"
                                htmlFor="min-value"
                              >
                                Min
                              </label>
                              <input
                                type="number"
                                title="min-value"
                                className="w-20 p-1 border rounded text-center h-8"
                                value={filterRange.min}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (
                                    !isNaN(value) &&
                                    value >= 0 &&
                                    value <= filterRange.max
                                  ) {
                                    setFilterRange({
                                      min: value,
                                      max: filterRange.max,
                                    });
                                  }
                                }}
                              />
                            </div>

                            <div className="flex flex-col items-center">
                              <label
                                className="text-muted-foreground mb-1 uppercase text-[10px] tracking-wide"
                                htmlFor="max-value"
                              >
                                Max
                              </label>
                              <input
                                title="max-value"
                                type="number"
                                className="w-20 p-1 border rounded text-center h-8"
                                value={filterRange.max}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (
                                    !isNaN(value) &&
                                    value >= filterRange.min &&
                                    value <= currentMaxValue
                                  ) {
                                    setFilterRange({
                                      min: filterRange.min,
                                      max: value,
                                    });
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs uppercase tracking-wide"
                            onClick={resetFilters}
                          >
                            {dictionary.map.filters.reset}
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <MapLegend />
                </div>
              </TabsContent>

              <TabsContent value="layers">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="layer-areas"
                      className="cursor-pointer text-xs uppercase tracking-wide"
                    >
                      Grid Areas
                    </Label>
                    <Switch
                      id="layer-areas"
                      checked={visibleLayers.includes("areas")}
                      onCheckedChange={() => handleLayerToggle("areas")}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="style">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide">
                      Color Scheme
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["classic", "viridis", "plasma", "magma", "inferno"].map(
                        (scheme) => (
                          <Button
                            key={scheme}
                            variant="outline"
                            className="h-9 uppercase text-xs tracking-wide"
                            onClick={() => handleColorSchemeSelect(scheme)}
                          >
                            {scheme}
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="default"
          className="shadow-md uppercase text-xs tracking-wide font-medium ml-5"
          onClick={togglePanel}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> {dictionary.map.filters.title}
        </Button>
      )}
    </div>
  );
}
