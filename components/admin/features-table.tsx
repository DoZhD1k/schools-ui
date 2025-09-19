"use client";

import React, { useState } from "react";
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
import { Loader2, Edit2 } from "lucide-react";
import { EnrichedGridFeature } from "@/types/geojson";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface FeaturesTableProps {
  features: EnrichedGridFeature[];
  loading: boolean;
  collectionId: number | null;
  onEditFeature: (feature: EnrichedGridFeature) => void;
  dictionary: {
    title: string;
    noCollectionTitle: string;
    addButton: string;
    noData: string;
    noDataNote: string;
    table: {
      id: string;
      name: string;
      gridId: string;
      area: string;
      population: string;
      actions: string;
    };
    edit: string;
    pagination: {
      showing: string;
      of: string;
      items: string;
      itemsPerPage: string;
    };
  };
}

// Swiss design-inspired animation variants
const swissEase = [0.23, 1, 0.32, 1];

const tableRowVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.05,
      duration: 0.4,
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

export const FeaturesTable: React.FC<FeaturesTableProps> = ({
  features,
  loading,
  collectionId,
  onEditFeature,
  dictionary,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalFeatures = features.length;
  const totalPages = Math.ceil(totalFeatures / pageSize);

  // Индексы для текущей страницы
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFeatures);

  // Текущие отображаемые данные
  const currentFeatures = features.slice(startIndex, endIndex);

  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Обработчик изменения размера страницы
  const handlePageSizeChange = (size: string) => {
    setPageSize(Number(size));
    setCurrentPage(1); // Сбрасываем на первую страницу при смене размера
  };

  // Функция для создания массива страниц для отображения
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Максимальное число отображаемых страниц

    if (totalPages <= maxVisiblePages) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Определяем диапазон отображаемых страниц
      let startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      // Корректируем начальную страницу, если достигли конца
      if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - maxVisiblePages + 1);
      }

      // Добавляем первую страницу и многоточие
      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push("ellipsis-start");
        }
      }

      // Добавляем страницы внутри диапазона
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Добавляем многоточие и последнюю страницу
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pageNumbers.push("ellipsis-end");
        }
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  if (!collectionId) {
    return (
      <motion.div variants={alertVariants} initial="hidden" animate="visible">
        <Alert className="bg-muted/50 border-l-4 border-primary">
          <AlertTitle className="text-lg font-medium mb-2">
            {dictionary.noCollectionTitle}
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {dictionary.noDataNote}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

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

  if (features.length === 0) {
    return (
      <motion.div variants={alertVariants} initial="hidden" animate="visible">
        <Alert className="bg-muted/50 border-l-4 border-primary">
          <AlertTitle className="text-lg font-medium mb-2">
            {dictionary.noData}
          </AlertTitle>
          <AlertDescription className="text-muted-foreground">
            {dictionary.noDataNote}
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {dictionary.pagination?.showing || "Showing"} {startIndex + 1}-
          {endIndex} {dictionary.pagination?.of || "of"} {totalFeatures}{" "}
          {dictionary.pagination?.items || "items"}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {dictionary.pagination?.itemsPerPage || "Items per page"}:
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="7">7</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="h-[400px] rounded-md border border-muted/20 p-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70 w-[80px]">
                  {dictionary.table.id}
                </TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70">
                  {dictionary.table.name}
                </TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70 hidden sm:table-cell">
                  {dictionary.table.gridId}
                </TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70 hidden md:table-cell">
                  {dictionary.table.area}
                </TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70 hidden md:table-cell">
                  {dictionary.table.population}
                </TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70 text-right">
                  {dictionary.table.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentFeatures.map((feature, index) => (
                <motion.tr
                  key={feature.id}
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
                    {feature.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {feature.properties.name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {feature.properties.grid_id}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    <span className="font-mono">
                      {feature.properties.area_km2}
                    </span>{" "}
                    km²
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    <span className="font-mono">
                      {feature.properties.population?.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="inline-block"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditFeature(feature)}
                        className="text-foreground/70 hover:text-foreground hover:bg-muted/20 rounded-md"
                      >
                        <Edit2 className="h-4 w-4 mr-1 opacity-70" />
                        {dictionary.edit}
                      </Button>
                    </motion.div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </ScrollArea>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) => {
                if (page === "ellipsis-start" || page === "ellipsis-end") {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={index}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() =>
                        typeof page === "number" && handlePageChange(page)
                      }
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};
