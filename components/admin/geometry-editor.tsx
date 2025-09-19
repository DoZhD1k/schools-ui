"use client";

import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MultiPolygonGeometry } from "@/types/admin";
import { Code, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GeometryEditorProps {
  value: MultiPolygonGeometry | null;
  onChange: (geometry: MultiPolygonGeometry | null) => void;
  error?: string;
}

export const GeometryEditor: React.FC<GeometryEditorProps> = ({
  value,
  onChange,
  error,
}) => {
  const [jsonText, setJsonText] = useState<string>("");
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (value) {
      setJsonText(JSON.stringify(value, null, 2));
      setParseError(null);
    } else {
      setJsonText("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    try {
      if (e.target.value.trim()) {
        const parsed = JSON.parse(e.target.value);
        if (parsed.type !== "MultiPolygon") {
          setParseError("Geometry must be of type MultiPolygon");
        } else if (!Array.isArray(parsed.coordinates)) {
          setParseError("MultiPolygon coordinates must be an array");
        } else {
          setParseError(null);
          onChange(parsed as MultiPolygonGeometry);
        }
      } else {
        setParseError(null);
        onChange(null);
      }
    } catch (error) {
      setParseError("Invalid JSON format");
      // Don't update the parent state on invalid JSON
    }
  };

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium flex items-center">
          <Code className="h-4 w-4 mr-2 text-muted-foreground" />
          GeoJSON Geometry (MultiPolygon)
        </Label>

        {(parseError || error) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center text-red-500 text-xs"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            <span>Error</span>
          </motion.div>
        )}
      </div>

      <div className="relative">
        <Textarea
          rows={5}
          value={jsonText}
          onChange={handleChange}
          placeholder='{"type":"MultiPolygon","coordinates":[[[[x,y],[x,y],...]]]}'
          className={cn(
            "font-mono text-sm transition-all duration-300",
            "bg-muted/30 focus:bg-background focus-visible:ring-offset-2",
            "h-[100px] sm:h-[120px] md:h-[150px] resize-none",
            parseError || error ? "border-red-500 focus:ring-red-500/20" : ""
          )}
        />

        <motion.div
          className="absolute bottom-3 right-3 bg-muted/80 text-xs py-1 px-2 rounded text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.3 }}
        >
          GeoJSON
        </motion.div>
      </div>

      {(parseError || error) && (
        <motion.p
          className="text-sm text-red-500"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          {error || parseError}
        </motion.p>
      )}

      <motion.div
        className="text-xs text-muted-foreground mt-2 bg-muted/20 rounded-md p-3 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <details>
          <summary className="cursor-pointer font-medium mb-2">
            Example format (click to expand)
          </summary>
          <pre className="overflow-x-auto text-[11px] mt-2">
            {`{
  "type": "MultiPolygon",
  "coordinates": [
    [
      [[x1, y1], [x2, y2], [x3, y3], ..., [x1, y1]]
    ]
  ]
}`}
          </pre>
        </details>
      </motion.div>
    </motion.div>
  );
};
