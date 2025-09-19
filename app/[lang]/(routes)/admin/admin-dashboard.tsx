"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { withAuth } from "@/components/hoc/withAuth";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Import component types
import {
  CollectionList,
  FeatureProperties,
  MultiPolygonGeometry,
} from "@/types/admin";
import { EnrichedGridFeature } from "@/types/geojson";

// Import modular components
import AdminHeader from "@/components/admin/AdminHeader";
import AdminTabs from "@/components/admin/AdminTabs";
import CollectionsTabContent from "@/components/admin/CollectionsTabContent";
import FeaturesTabContent from "@/components/admin/FeaturesTabContent";
import UsersTabContent from "@/components/admin/UsersTabContent";
import { UploadForm } from "@/components/admin/upload-form";
import { RegisterUserForm } from "@/components/admin/register-user-form";
import { FeatureForm } from "@/components/admin/feature-form";

// Import services
import { CollectionsService } from "@/services/collections.service";
import { FeaturesService } from "@/services/features.service";
import { UsersService } from "@/services/users.service";

interface AdminDashboardProps {
  dictionary: {
    admin: {
      title: string;
      description: string;
      tabs: {
        collections: string;
        features: string;
        users: string;
      };
      collections: {
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
      features: {
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
      users: {
        title: string;
        addButton: string;
        noData: string;
        noDataNote: string;
        table: {
          id: string;
          username: string;
          role: string;
          status: string;
          actions: string;
        };
        actions: {
          activate: string;
          deactivate: string;
          delete: string;
        };
        deleteDialog: {
          title: string;
          description: string;
          cancel: string;
          confirm: string;
        };
        success: {
          activate: string;
          deactivate: string;
          delete: string;
        };
        errors: {
          activate: string;
          deactivate: string;
          delete: string;
        };
      };
      upload: {
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
      register: {
        title: string;
        description: string;
        form: {
          username: string;
          email: string;
          password: string;
          role: string;
          selectRole: string;
          userRole: string;
          adminRole: string;
        };
        cancel: string;
        submit: string;
        success: string;
      };
      feature: {
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
      errors: {
        collections?: string;
        features?: string;
        users?: string;
        upload?: string;
        register?: string;
        addFeature?: string;
        updateFeature?: string;
        activateUser?: string;
        deactivateUser?: string;
        deleteUser?: string;
      };
    };
  };
}

// Swiss design-inspired animation variants
const swissEase = [0.23, 1, 0.32, 1];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: swissEase,
    },
  },
};

const AdminDashboard = ({ dictionary }: AdminDashboardProps) => {
  const { admin } = dictionary;
  const { accessToken } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState("collections");

  // Data states
  const [collections, setCollections] = useState<CollectionList[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [features, setFeatures] = useState<EnrichedGridFeature[]>([]);

  // UI control states
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCollection, setSelectedCollection] = useState<number | null>(
    null
  );
  const [selectedFeature, setSelectedFeature] =
    useState<EnrichedGridFeature | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Dialog states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAddFeatureOpen, setIsAddFeatureOpen] = useState(false);
  const [isEditFeatureOpen, setIsEditFeatureOpen] = useState(false);

  // Load initial data based on active tab
  useEffect(() => {
    if (activeTab === "collections") {
      fetchCollections();
    } else if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, accessToken]);

  // Fetch data methods using services
  const fetchCollections = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const data = await CollectionsService.getCollections(accessToken);
      setCollections(data);
    } catch (error: any) {
      console.error("Error fetching collections:", error);
      toast.error("Error", {
        description:
          error.message ||
          admin.errors.collections ||
          "Error fetching collections",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const data = await UsersService.getUsers(accessToken);
      console.log("Fetched users data:", data);

      // Обогащаем данные пользователей свойством isActive
      // По умолчанию считаем, что все пользователи активны
      // В реальном приложении это свойство должно приходить с сервера
      const enrichedUsers = data.map((user) => ({
        ...user,
        isActive: user.isActive !== undefined ? user.isActive : true,
      }));

      console.log("Enriched users data:", enrichedUsers);
      setUsers(enrichedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Error", {
        description:
          error.message || admin.errors.users || "Error fetching users",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeatures = async (collectionId: number) => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const data = await FeaturesService.getFeaturesByCollection(
        collectionId,
        accessToken
      );
      setFeatures(data);
    } catch (error: any) {
      console.error("Error fetching features:", error);
      toast.error("Error", {
        description:
          error.message || admin.errors.features || "Error fetching features",
      });
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleViewFeatures = (collectionId: number) => {
    setSelectedCollection(collectionId);
    setActiveTab("features");
    fetchFeatures(collectionId);
  };

  const handleEditFeature = (feature: EnrichedGridFeature) => {
    setSelectedFeature(feature);
    setIsEditFeatureOpen(true);
  };

  // Form submission handlers
  const handleUploadSubmit = async (data: {
    name: string;
    description: string;
    file: File;
  }) => {
    if (!accessToken) return;

    setErrorMessage("");
    setLoading(true);

    try {
      await CollectionsService.uploadGeoJSON(accessToken, data);

      toast.success("Success", {
        description: admin.upload.success,
      });

      setIsUploadOpen(false);
      fetchCollections();
    } catch (error: any) {
      console.error("Error uploading file:", error);
      setErrorMessage(
        error.message || admin.errors.upload || "Error uploading file"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = async (data: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => {
    if (!accessToken) return;

    setErrorMessage("");
    setLoading(true);

    try {
      await UsersService.registerUser(data, accessToken);

      toast.success("Success", {
        description: admin.register.success,
      });

      setIsAddUserOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error registering user:", error);
      setErrorMessage(
        error.message || admin.errors.register || "Error registering user"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = async (data: {
    properties: Partial<FeatureProperties>;
    geometry: MultiPolygonGeometry | null;
  }) => {
    if (!accessToken || !selectedCollection) {
      setErrorMessage("No collection selected or not authenticated");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      await FeaturesService.addFeature(selectedCollection, data, accessToken);

      toast.success("Success", {
        description: admin.feature.success.add,
      });

      setIsAddFeatureOpen(false);
      fetchFeatures(selectedCollection);
    } catch (error: any) {
      console.error("Error adding feature:", error);
      setErrorMessage(
        error.message || admin.errors.addFeature || "Error adding feature"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeature = async (data: {
    properties: Partial<FeatureProperties>;
    geometry: MultiPolygonGeometry | null;
  }) => {
    if (!accessToken || !selectedFeature || !selectedFeature.id) {
      setErrorMessage("No feature selected for update or not authenticated");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      await FeaturesService.updateFeature(
        selectedFeature.id,
        data,
        accessToken
      );

      toast.success("Success", {
        description: admin.feature.success.update,
      });

      setIsEditFeatureOpen(false);
      if (selectedCollection) {
        fetchFeatures(selectedCollection);
      }
      setSelectedFeature(null);
    } catch (error: any) {
      console.error("Error updating feature:", error);
      setErrorMessage(
        error.message || admin.errors.updateFeature || "Error updating feature"
      );
    } finally {
      setLoading(false);
    }
  };

  // Format strings with placeholders
  const formatString = (str: string, params: Record<string, any>) => {
    return str.replace(/\{([^}]+)\}/g, (_, key) => params[key] || "");
  };

  return (
    <div className="container max-w-7xl mx-auto py-16 px-4 sm:px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        <AdminHeader title={admin.title} description={admin.description} />

        <motion.div variants={cardVariants}>
          <Card className="border-0 shadow-lg bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-muted/50 p-4 border-b">
                {/* Create a proper Tabs wrapper that maintains the tabs state */}
                <Tabs
                  defaultValue="collections"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  {/* Use the AdminTabs component for the tabs header/navigation */}
                  <AdminTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    tabLabels={admin.tabs}
                  />

                  <div className="mt-8 px-4 pb-6">
                    <AnimatePresence mode="wait">
                      {/* Collections Tab Content */}
                      <TabsContent
                        key="collections-tab"
                        value="collections"
                        className="mt-0 space-y-6"
                      >
                        <CollectionsTabContent
                          collections={collections}
                          loading={loading}
                          onViewFeatures={handleViewFeatures}
                          onUploadOpen={() => setIsUploadOpen(true)}
                          dictionary={admin.collections}
                        />
                      </TabsContent>

                      {/* Features Tab Content */}
                      <TabsContent
                        key="features-tab"
                        value="features"
                        className="mt-0 space-y-6"
                      >
                        <FeaturesTabContent
                          features={features}
                          loading={loading}
                          selectedCollection={selectedCollection}
                          onEditFeature={handleEditFeature}
                          onAddFeatureOpen={() => setIsAddFeatureOpen(true)}
                          dictionary={admin.features}
                          formatString={formatString}
                        />
                      </TabsContent>

                      {/* Users Tab Content */}
                      <TabsContent
                        key="users-tab"
                        value="users"
                        className="mt-0 space-y-6"
                      >
                        <UsersTabContent
                          users={users}
                          loading={loading}
                          onAddUserOpen={() => setIsAddUserOpen(true)}
                          refreshUsers={fetchUsers}
                          dictionary={admin.users}
                        />
                      </TabsContent>
                    </AnimatePresence>
                  </div>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Upload GeoJSON Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{admin.upload.title}</DialogTitle>
            <DialogDescription>{admin.upload.description}</DialogDescription>
          </DialogHeader>

          <UploadForm
            onSubmit={handleUploadSubmit}
            onCancel={() => setIsUploadOpen(false)}
            isLoading={loading}
            error={errorMessage}
            dictionary={admin.upload}
          />
        </DialogContent>
      </Dialog>

      {/* Register User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{admin.register.title}</DialogTitle>
            <DialogDescription>{admin.register.description}</DialogDescription>
          </DialogHeader>

          <RegisterUserForm
            onSubmit={handleRegisterUser}
            onCancel={() => setIsAddUserOpen(false)}
            isLoading={loading}
            error={errorMessage}
            dictionary={admin.register}
          />
        </DialogContent>
      </Dialog>

      {/* Add Feature Dialog */}
      <Dialog open={isAddFeatureOpen} onOpenChange={setIsAddFeatureOpen}>
        <DialogContent className="sm:max-w-[90%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[60%] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle>{admin.feature.add.title}</DialogTitle>
            <DialogDescription>
              {formatString(admin.feature.add.description, {
                id: selectedCollection,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="pr-1">
            <FeatureForm
              onSubmit={handleAddFeature}
              onCancel={() => setIsAddFeatureOpen(false)}
              isLoading={loading}
              error={errorMessage}
              isEditing={false}
              dictionary={admin.feature}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Feature Dialog */}
      <Dialog open={isEditFeatureOpen} onOpenChange={setIsEditFeatureOpen}>
        <DialogContent className="sm:max-w-[90%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-[60%] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <DialogTitle>{admin.feature.edit.title}</DialogTitle>
            <DialogDescription>
              {formatString(admin.feature.edit.description, {
                id: selectedFeature?.id,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="pr-1">
            <FeatureForm
              onSubmit={handleUpdateFeature}
              onCancel={() => setIsEditFeatureOpen(false)}
              isLoading={loading}
              error={errorMessage}
              feature={selectedFeature}
              isEditing={true}
              dictionary={admin.feature}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withAuth(AdminDashboard);
