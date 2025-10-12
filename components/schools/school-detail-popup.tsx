"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  X,
  MapPin,
  School,
  Trophy,
  Award,
  GraduationCap,
  Users,
  Shield,
  Building,
  TrendingUp,
  Zap,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CombinedSchool } from "../../app/[lang]/(routes)/schools/page copy";

type RatingKeys =
  | "academic_results_rating"
  | "graduate_success_rating"
  | "pedagogical_potential_rating"
  | "infrastructure_rating"
  | "safety_climate_rating"
  | "gis_rating"
  | "digital_rating";

type CombinedSchoolRatings = Pick<CombinedSchool, RatingKeys> & CombinedSchool;

interface Props {
  isOpen: boolean;
  school: CombinedSchool | null;
  onClose: () => void;
  getRatingInfo: (rating: number | null | undefined) => {
    color: string;
    bgColor: string;
    icon: LucideIcon;
  };
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300, duration: 0.3 },
  },
  exit: { opacity: 0, scale: 0.95, y: 50, transition: { duration: 0.2 } },
};

export default function SchoolDetailPopup({
  isOpen,
  school,
  onClose,
  getRatingInfo,
}: Props) {
  if (!school) return null;

  const formatRating = (v?: number | null) =>
    v === undefined || v === null ? "—" : `${v.toFixed(1)}%`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-200"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
              <Button
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <School className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold leading-tight">
                    {school.name_of_the_organization}
                  </h2>
                  <div className="flex items-center gap-2 text-blue-100">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {school.district}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Паспорт организации
                </h3>
              </div>

              {school.gis_rating && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        Общий рейтинг
                      </p>
                      <p className="text-xl font-bold text-blue-700">
                        {formatRating(school.digital_rating)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ratings */}
              {[
                {
                  key: "academic_results_rating",
                  label: "Качество знаний",
                  icon: GraduationCap,
                },
                {
                  key: "graduate_success_rating",
                  label: "Динамика результатов школы",
                  icon: TrendingUp,
                },
                {
                  key: "pedagogical_potential_rating",
                  label: "Квалификация педагогов",
                  icon: Users,
                },
                {
                  key: "infrastructure_rating",
                  label: "Оснащенность школы",
                  icon: Building,
                },
                {
                  key: "safety_climate_rating",
                  label: "Безопасность",
                  icon: Shield,
                },
                { key: "gis_rating", label: "GIS рейтинг", icon: Zap },
              ].map(({ key, label, icon: Icon }) => {
                const value = (school as CombinedSchoolRatings)[
                  key as RatingKeys
                ];
                return (
                  value !== undefined && (
                    <div
                      key={key}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors mb-4"
                    >
                      <div
                        className={`p-3 rounded-lg ${
                          getRatingInfo(value).bgColor
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${getRatingInfo(value).color}`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{label}</p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          key === "gis_rating"
                            ? getRatingInfo(
                                value !== null && value !== undefined
                                  ? (value / 5) * 100
                                  : null
                              ).bgColor
                            : getRatingInfo(value).bgColor
                        } ${
                          key === "gis_rating"
                            ? getRatingInfo(
                                value !== null && value !== undefined
                                  ? (value / 5) * 100
                                  : null
                              ).color
                            : getRatingInfo(value).color
                        }`}
                      >
                        {key === "gis_rating" ? value : formatRating(value)}
                      </div>
                    </div>
                  )
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200">
              <div className="flex justify-end">
                <Button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Экспорт
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
