"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2, Upload } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    file: File;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error?: string;
  dictionary: {
    title: string;
    description: string;
    form: {
      name: string;
      description: string;
      file: string;
    };
    cancel: string;
    submit: string;
    success: string;
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
      delay: custom * 0.1,
      duration: 0.5,
      ease: swissEase,
    },
  }),
};

export const UploadForm: React.FC<UploadFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  error,
  dictionary,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    file?: string;
  }>({});
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors: { name?: string; file?: string } = {};
    if (!name.trim()) {
      errors.name = "Name is required";
    }
    if (!file) {
      errors.file = "File is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Submit if valid
    if (file) {
      await onSubmit({ name, description, file });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFormErrors({ ...formErrors, file: undefined });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setFormErrors({ ...formErrors, file: undefined });
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive" className="border-l-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div variants={formItemVariants} custom={0} className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          {dictionary.form.name}
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setFormErrors({ ...formErrors, name: undefined });
          }}
          className={cn(
            "transition-all duration-200 focus-visible:ring-offset-2",
            formErrors.name ? "border-red-500 focus:ring-red-500/20" : ""
          )}
          required
        />
        {formErrors.name && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-500 mt-1"
          >
            {formErrors.name}
          </motion.p>
        )}
      </motion.div>

      <motion.div variants={formItemVariants} custom={1} className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          {dictionary.form.description}
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-24 transition-all duration-200 focus-visible:ring-offset-2"
        />
      </motion.div>

      <motion.div variants={formItemVariants} custom={2} className="space-y-2">
        <Label htmlFor="file" className="text-sm font-medium">
          {dictionary.form.file}
        </Label>
        <div
          className={cn(
            "border-2 border-dashed rounded-md p-6 transition-all duration-200",
            isDragging ? "border-primary bg-primary/5" : "border-border",
            formErrors.file ? "border-red-500" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium">
              {file ? file.name : "Drop your file here, or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">.geojson, .json</p>
            <Input
              id="file"
              type="file"
              accept=".geojson,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById("file")?.click()}
              className="bg-muted/50 hover:bg-muted text-sm px-4 py-2 rounded-md mt-2"
            >
              Select file
            </motion.button>
          </div>
        </div>
        {formErrors.file && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-500 mt-1"
          >
            {formErrors.file}
          </motion.p>
        )}
      </motion.div>

      <motion.div variants={formItemVariants} custom={3}>
        <DialogFooter className="flex justify-between space-x-2 mt-6">
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
              {dictionary.submit}
            </Button>
          </motion.div>
        </DialogFooter>
      </motion.div>
    </motion.form>
  );
};
