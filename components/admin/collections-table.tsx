"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight } from "lucide-react";
import { CollectionList } from "@/types/admin";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface CollectionsTableProps {
  collections: CollectionList[];
  loading: boolean;
  onViewFeatures: (collectionId: number) => void;
  dictionary: {
    title: string;
    uploadButton: string;
    noData: string;
    uploadNote: string;
    table: {
      id: string;
      name: string;
      description: string;
      createdAt: string;
      actions: string;
    };
    viewFeatures: string;
  };
}

// Swiss design-inspired animation variants
const swissEase = [0.23, 1, 0.32, 1];

const tableRowVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    transition: {
      delay: custom * 0.08,
      duration: 0.5,
      ease: swissEase,
    },
  }),
};

const alertVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: swissEase,
    },
  },
};

export const CollectionsTable: React.FC<CollectionsTableProps> = ({
  collections,
  loading,
  onViewFeatures,
  dictionary,
}) => {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center py-16"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </motion.div>
    );
  }

  if (collections.length === 0) {
    return (
      <motion.div variants={alertVariants} initial="hidden" animate="visible">
        <Alert className="bg-muted/50 border-l-4 border-primary">
          <AlertTitle className="text-lg font-medium mb-2">
            {dictionary.noData}
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {dictionary.uploadNote}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border border-muted/20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70">
                {dictionary.table.id}
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70">
                {dictionary.table.name}
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70 hidden md:table-cell">
                {dictionary.table.description}
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70 hidden sm:table-cell">
                {dictionary.table.createdAt}
              </TableHead>
              <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70">
                {dictionary.table.actions}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((collection, index) => (
              <motion.tr
                key={collection.id}
                variants={tableRowVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                className={cn(
                  "border-b border-muted/10 transition-colors",
                  "hover:bg-muted/5"
                )}
                whileHover={{ backgroundColor: "rgba(var(--muted), 0.1)" }}
              >
                <TableCell className="font-mono text-sm">
                  {collection.id}
                </TableCell>
                <TableCell className="font-medium">{collection.name}</TableCell>
                <TableCell className="text-muted-foreground hidden md:table-cell max-w-xs truncate">
                  {collection.description}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground/80 text-sm">
                  {new Date(collection.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewFeatures(collection.id)}
                      className="border-primary/20 text-primary flex items-center gap-2 transition-all hover:border-primary"
                    >
                      {dictionary.viewFeatures}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </motion.div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </ScrollArea>
  );
};
