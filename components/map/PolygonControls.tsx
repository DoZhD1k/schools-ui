"use client";

import React from "react";
import { useMapContext } from "@/contexts/map-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Settings } from "lucide-react";

export default function PolygonControls() {
  const { showPolygons, setShowPolygons, polygons } = useMapContext();

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
              Показано {polygons?.length || 0} полигонов
            </div>
          )}

          {!showPolygons && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <EyeOff className="h-4 w-4" />
              Полигоны скрыты
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
