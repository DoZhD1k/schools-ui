"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2, Save, Square, Grid3X3, Users, Box } from "lucide-react";
import { GeometryEditor } from "./geometry-editor";
import { FeatureProperties, MultiPolygonGeometry } from "@/types/admin";
import { EnrichedGridFeature } from "@/types/geojson";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureFormProps {
  onSubmit: (data: {
    properties: Partial<FeatureProperties>;
    geometry: MultiPolygonGeometry | null;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error?: string;
  feature?: EnrichedGridFeature | null;
  isEditing?: boolean;
  dictionary: {
    add: {
      title: string;
      description: string;
    };
    edit: {
      title: string;
      description: string;
    };
    form: {
      name: string;
      nameRu: string;
      gridId: string;
      areaKm2: string;
      population: string;
      crimesCount: string;
      camerasCount: string;
      companyCount: string;
      geometry: string;
    };
    cancel: string;
    submit: {
      add: string;
      update: string;
    };
    success: {
      add: string;
      update: string;
    };
  };
}

// Swiss design-inspired animation variants
const swissEase = [0.23, 1, 0.32, 1];

const formItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.07,
      duration: 0.5,
      ease: swissEase,
    },
  }),
};

const alertVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: swissEase,
    },
  },
};

export const FeatureForm: React.FC<FeatureFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  error,
  feature,
  isEditing = false,
  dictionary,
}) => {
  const [properties, setProperties] = useState<Partial<FeatureProperties>>({
    name: "",
    nameRu: "",
    grid_id: 0,
    area_m2: 0,
    area_km2: 0,
    population: 0,
    crimes_count: 0,
    cameras_count: 0,
    company_count: 0,
  });

  const [geometry, setGeometry] = useState<MultiPolygonGeometry | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Initialize form with feature data if provided (for editing)
  useEffect(() => {
    if (feature && feature.properties) {
      setProperties({ ...feature.properties });
      if (feature.geometry && feature.geometry.type === "MultiPolygon") {
        setGeometry(feature.geometry as MultiPolygonGeometry);
      }
    }
  }, [feature]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors: Record<string, string> = {};
    if (!properties.name?.trim()) {
      errors.name = "Name is required";
    }
    if (!properties.nameRu?.trim()) {
      errors.nameRu = "Russian name is required";
    }
    if (!geometry && !isEditing) {
      errors.geometry = "Geometry is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Submit if valid
    await onSubmit({ properties, geometry });
  };

  const handlePropertyChange = (key: keyof FeatureProperties, value: any) => {
    setProperties((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Clear error for this field if any
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Special handler for area_km2 that also updates area_m2
  const handleAreaChange = (km2Value: number) => {
    setProperties((prev) => ({
      ...prev,
      area_km2: km2Value,
      area_m2: km2Value * 1000000,
    }));
  };

  // Get the appropriate icon for each form field
  const getFieldIcon = (field: string) => {
    switch (field) {
      case "name":
      case "nameRu":
        return <Square className="h-4 w-4" />;
      case "grid_id":
        return <Grid3X3 className="h-4 w-4" />;
      case "area_km2":
        return <Box className="h-4 w-4" />;
      case "population":
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial="hidden"
      animate="visible"
    >
      {error && (
        <motion.div variants={alertVariants} initial="hidden" animate="visible">
          <Alert variant="destructive" className="border-l-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="space-y-4">
        {/* Basic properties section */}
        <motion.div variants={formItemVariants} custom={0}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">
                {dictionary.form.name}
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  {getFieldIcon("name")}
                </div>
                <Input
                  id="name"
                  value={properties.name || ""}
                  onChange={(e) => handlePropertyChange("name", e.target.value)}
                  className={cn(
                    "pl-10 transition-all duration-200 focus-visible:ring-offset-1",
                    formErrors.name
                      ? "border-red-500 focus:ring-red-500/20"
                      : "",
                    "bg-muted/30 focus:bg-background"
                  )}
                  required={!isEditing}
                />
              </div>
              {formErrors.name && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-500 mt-1"
                >
                  {formErrors.name}
                </motion.p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nameRu" className="text-sm font-medium">
                {dictionary.form.nameRu}
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  {getFieldIcon("nameRu")}
                </div>
                <Input
                  id="nameRu"
                  value={properties.nameRu || ""}
                  onChange={(e) =>
                    handlePropertyChange("nameRu", e.target.value)
                  }
                  className={cn(
                    "pl-10 transition-all duration-200 focus-visible:ring-offset-1",
                    formErrors.nameRu
                      ? "border-red-500 focus:ring-red-500/20"
                      : "",
                    "bg-muted/30 focus:bg-background"
                  )}
                  required={!isEditing}
                />
              </div>
              {formErrors.nameRu && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-500 mt-1"
                >
                  {formErrors.nameRu}
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Numerical data section */}
        <motion.div variants={formItemVariants} custom={1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="grid_id" className="text-sm font-medium">
                {dictionary.form.gridId}
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  {getFieldIcon("grid_id")}
                </div>
                <Input
                  id="grid_id"
                  type="number"
                  value={properties.grid_id || 0}
                  onChange={(e) =>
                    handlePropertyChange(
                      "grid_id",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="pl-10 bg-muted/30 focus:bg-background transition-all duration-200 focus-visible:ring-offset-1"
                  required={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="area_km2" className="text-sm font-medium">
                {dictionary.form.areaKm2}
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  {getFieldIcon("area_km2")}
                </div>
                <Input
                  id="area_km2"
                  type="number"
                  step="0.01"
                  value={properties.area_km2 || 0}
                  onChange={(e) =>
                    handleAreaChange(parseFloat(e.target.value) || 0)
                  }
                  className="pl-10 bg-muted/30 focus:bg-background transition-all duration-200 focus-visible:ring-offset-1"
                  required={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="population" className="text-sm font-medium">
                {dictionary.form.population}
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  {getFieldIcon("population")}
                </div>
                <Input
                  id="population"
                  type="number"
                  value={properties.population || 0}
                  onChange={(e) =>
                    handlePropertyChange(
                      "population",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="pl-10 bg-muted/30 focus:bg-background transition-all duration-200 focus-visible:ring-offset-1"
                  required={!isEditing}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional metrics section */}
        <motion.div variants={formItemVariants} custom={2}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="crimes_count" className="text-sm font-medium">
                {dictionary.form.crimesCount}
              </Label>
              <Input
                id="crimes_count"
                type="number"
                value={properties.crimes_count || 0}
                onChange={(e) =>
                  handlePropertyChange(
                    "crimes_count",
                    parseInt(e.target.value) || 0
                  )
                }
                className="bg-muted/30 focus:bg-background transition-all duration-200 focus-visible:ring-offset-1"
                required={!isEditing}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cameras_count" className="text-sm font-medium">
                {dictionary.form.camerasCount}
              </Label>
              <Input
                id="cameras_count"
                type="number"
                value={properties.cameras_count || 0}
                onChange={(e) =>
                  handlePropertyChange(
                    "cameras_count",
                    parseInt(e.target.value) || 0
                  )
                }
                className="bg-muted/30 focus:bg-background transition-all duration-200 focus-visible:ring-offset-1"
                required={!isEditing}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company_count" className="text-sm font-medium">
                {dictionary.form.companyCount}
              </Label>
              <Input
                id="company_count"
                type="number"
                value={properties.company_count || 0}
                onChange={(e) =>
                  handlePropertyChange(
                    "company_count",
                    parseInt(e.target.value) || 0
                  )
                }
                className="bg-muted/30 focus:bg-background transition-all duration-200 focus-visible:ring-offset-1"
                required={!isEditing}
              />
            </div>
          </div>
        </motion.div>

        {/* Geometry editor section */}
        <motion.div variants={formItemVariants} custom={3}>
          <GeometryEditor
            value={geometry}
            onChange={setGeometry}
            error={formErrors.geometry}
          />
        </motion.div>
      </div>

      <motion.div variants={formItemVariants} custom={4}>
        <DialogFooter className="flex sm:justify-between space-x-2 mt-6 pt-4 border-t border-muted/30">
          <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="font-medium border-border"
            >
              {dictionary.cancel}
            </Button>
          </motion.div>

          <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}>
            <Button type="submit" disabled={isLoading} className="font-medium">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isLoading && <Save className="mr-2 h-4 w-4" />}
              {isEditing ? dictionary.submit.update : dictionary.submit.add}
            </Button>
          </motion.div>
        </DialogFooter>
      </motion.div>
    </motion.form>
  );
};
