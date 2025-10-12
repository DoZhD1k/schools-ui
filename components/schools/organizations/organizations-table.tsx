"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Eye,
  User,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { OrganizationData } from "./organization-card";

interface OrganizationsTableProps {
  organizations: OrganizationData[];
  onView: (org: OrganizationData) => void;
  onSort: (column: string) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const OrganizationsTable = ({
  organizations,
  onView,
  onSort,
  sortBy,
  sortOrder,
}: OrganizationsTableProps) => {
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());

  const getRatingZoneColor = (zone: string) => {
    switch (zone) {
      case "green":
        return "#22c55e";
      case "yellow":
        return "#eab308";
      case "red":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrgs(new Set(organizations.map((org) => org.id)));
    } else {
      setSelectedOrgs(new Set());
    }
  };

  const handleSelectOrg = (orgId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrgs);
    if (checked) {
      newSelected.add(orgId);
    } else {
      newSelected.delete(orgId);
    }
    setSelectedOrgs(newSelected);
  };

  const SortButton = ({
    column,
    children,
  }: {
    column: string;
    children: React.ReactNode;
  }) => (
    <div
      className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors select-none"
      onClick={() => onSort(column)}
    >
      <span>{children}</span>
      {sortBy === column ? (
        sortOrder === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-50" />
      )}
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
          <TableRow className="border-slate-200">
            <TableHead className="w-12">
              <Checkbox
                checked={
                  selectedOrgs.size === organizations.length &&
                  organizations.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="min-w-[250px]">
              <SortButton column="nameRu">Организация</SortButton>
            </TableHead>
            <TableHead className="w-32">
              <SortButton column="district">Район</SortButton>
            </TableHead>
            <TableHead className="w-32 text-center">
              <SortButton column="currentRating">
                <div className="flex flex-col items-center">
                  <span>Общий рейтинг</span>
                  <span className="text-xs font-normal text-slate-500">
                    (взвешенный)
                  </span>
                </div>
              </SortButton>
            </TableHead>
            <TableHead className="w-28 text-center">
              <SortButton column="currentStudents">Учащиеся</SortButton>
            </TableHead>
            <TableHead className="w-24 text-center">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow
              key={org.id}
              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-emerald-50 transition-all duration-200"
            >
              <TableCell>
                <Checkbox
                  checked={selectedOrgs.has(org.id)}
                  onCheckedChange={(checked) =>
                    handleSelectOrg(org.id, !!checked)
                  }
                />
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-semibold text-slate-900 text-sm leading-tight mb-1">
                    {org.nameRu}
                  </p>
                  <p className="text-xs text-slate-500 mb-1">
                    {org.organizationType}
                  </p>
                  <div className="flex items-center text-xs text-slate-500">
                    <User className="h-3 w-3 mr-1" />
                    <span className="truncate">{org.director}</span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-slate-600">{org.district}</div>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: getRatingZoneColor(org.ratingZone),
                  }}
                  className="text-white font-bold px-2 py-1 text-sm"
                >
                  {org.currentRating}%
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">
                    {org.currentStudents.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    / {org.capacity.toLocaleString()}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(org)}
                  className="h-8 px-2 text-xs"
                >
                  <Eye className="h-3 w-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {organizations.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">
            Организации не найдены. Попробуйте изменить параметры фильтрации.
          </p>
        </div>
      )}
    </div>
  );
};
