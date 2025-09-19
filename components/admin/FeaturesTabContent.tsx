import React from "react";
import { motion, Variants } from "framer-motion";
import { Plus } from "lucide-react";
import { EnrichedGridFeature } from "@/types/geojson";
import { FeaturesTable } from "@/components/admin/features-table";
import SwissButton from "@/components/admin/SwissButton";

interface FeaturesTabContentProps {
  features: EnrichedGridFeature[];
  loading: boolean;
  selectedCollection: number | null;
  onEditFeature: (feature: EnrichedGridFeature) => void;
  onAddFeatureOpen: () => void;
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
  };
  formatString: (str: string, params: Record<string, any>) => string;
}

const tabContentVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 10,
    transition: {
      duration: 0.3,
      ease: [0.23, 1, 0.32, 1],
    },
  },
};

const FeaturesTabContent: React.FC<FeaturesTabContentProps> = ({
  features,
  loading,
  selectedCollection,
  onEditFeature,
  onAddFeatureOpen,
  dictionary,
  formatString,
}) => {
  return (
    <motion.div
      key="features-content"
      variants={tabContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-foreground tracking-tight">
          {selectedCollection
            ? formatString(dictionary.title, {
                id: selectedCollection,
              })
            : dictionary.noCollectionTitle}
        </h3>

        {selectedCollection && (
          <SwissButton
            onClick={onAddFeatureOpen}
            icon={<Plus className="mr-2 h-4 w-4" />}
          >
            {dictionary.addButton}
          </SwissButton>
        )}
      </div>

      <FeaturesTable
        features={features}
        loading={loading}
        collectionId={selectedCollection}
        onEditFeature={onEditFeature}
        dictionary={dictionary}
      />
    </motion.div>
  );
};

export default FeaturesTabContent;
