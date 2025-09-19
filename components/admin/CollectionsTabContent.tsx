import React from "react";
import { motion, Variants } from "framer-motion";
import { Upload } from "lucide-react";
import { CollectionList } from "@/types/admin";
import { CollectionsTable } from "@/components/admin/collections-table";
import SwissButton from "@/components/admin/SwissButton";

interface CollectionsTabContentProps {
  collections: CollectionList[];
  loading: boolean;
  onViewFeatures: (collectionId: number) => void;
  onUploadOpen: () => void;
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

const CollectionsTabContent: React.FC<CollectionsTabContentProps> = ({
  collections,
  loading,
  onViewFeatures,
  onUploadOpen,
  dictionary,
}) => {
  return (
    <motion.div
      key="collections-content"
      variants={tabContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-foreground tracking-tight">
          {dictionary.title}
        </h3>

        <SwissButton
          onClick={onUploadOpen}
          icon={<Upload className="mr-2 h-4 w-4" />}
        >
          {dictionary.uploadButton}
        </SwissButton>
      </div>

      <CollectionsTable
        collections={collections}
        loading={loading}
        onViewFeatures={onViewFeatures}
        dictionary={dictionary}
      />
    </motion.div>
  );
};

export default CollectionsTabContent;
