import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Plus } from "lucide-react";
import { UsersTable } from "@/components/admin/users-table";
import SwissButton from "@/components/admin/SwissButton";
import { UsersService } from "@/services/users.service";
import { useAuth } from "@/contexts/auth-context";
import { userList } from "@/types/admin";
import { toast } from "sonner";

// Default dictionary values
const defaultDictionary = {
  success: {
    activate: "User activated successfully!",
    deactivate: "User deactivated successfully!",
    delete: "User deleted successfully!",
  },
  errors: {
    activate: "Failed to activate user. Please try again.",
    deactivate: "Failed to deactivate user. Please try again.",
    delete: "Failed to delete user. Please try again.",
  },
};

interface UsersTabContentProps {
  users: userList[];
  loading: boolean;
  onAddUserOpen: () => void;
  refreshUsers: () => void;
  dictionary: {
    title: string;
    addButton: string;
    noData: string;
    noDataNote: string;
    table: {
      id: string;
      username: string;
      role: string;
      status?: string;
      actions?: string;
    };
    actions?: {
      activate?: string;
      deactivate?: string;
      delete?: string;
    };
    deleteDialog?: {
      title?: string;
      description?: string;
      cancel?: string;
      confirm?: string;
    };
    success?: {
      activate?: string;
      deactivate?: string;
      delete?: string;
    };
    errors?: {
      activate?: string;
      deactivate?: string;
      delete?: string;
    };
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

const UsersTabContent: React.FC<UsersTabContentProps> = ({
  users: initialUsers,
  loading,
  onAddUserOpen,
  refreshUsers,
  dictionary,
}) => {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<userList[]>(initialUsers);

  // Синхронизируем локальное состояние пользователей с пропсами при их изменении
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  // Merge the provided dictionary with default values
  const dict = {
    ...dictionary,
    success: {
      ...defaultDictionary.success,
      ...dictionary.success,
    },
    errors: {
      ...defaultDictionary.errors,
      ...dictionary.errors,
    },
  };

  const handleActivateUser = async (userId: number) => {
    if (!accessToken) return;

    try {
      await UsersService.activateUser(userId, accessToken);

      // Обновляем локальное состояние немедленно
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isActive: true } : user
        )
      );

      toast.success("Success", {
        description: dict.success.activate,
      });

      // Обновляем от сервера с задержкой
      setTimeout(refreshUsers, 500);
    } catch (error: any) {
      console.error("Error activating user:", error);
      toast.error("Error", {
        description:
          error.message || dict.errors.activate || "Error activating user",
      });
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    if (!accessToken) return;

    try {
      await UsersService.deactivateUser(userId, accessToken);

      // Обновляем локальное состояние немедленно
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, isActive: false } : user
        )
      );

      toast.success("Success", {
        description: dict.success.deactivate,
      });

      // Обновляем от сервера с задержкой
      setTimeout(refreshUsers, 500);
    } catch (error: any) {
      console.error("Error deactivating user:", error);
      toast.error("Error", {
        description:
          error.message || dict.errors.deactivate || "Error deactivating user",
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!accessToken) return;

    try {
      await UsersService.deleteUser(userId, accessToken);
      toast.success("Success", {
        description: dict.success.delete,
      });
      refreshUsers();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error("Error", {
        description:
          error.message || dict.errors.delete || "Error deleting user",
      });
    }
  };

  return (
    <motion.div
      key="users-content"
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
          onClick={onAddUserOpen}
          icon={<Plus className="mr-2 h-4 w-4" />}
        >
          {dictionary.addButton}
        </SwissButton>
      </div>

      <UsersTable
        users={users}
        loading={loading}
        onActivateUser={handleActivateUser}
        onDeactivateUser={handleDeactivateUser}
        onDeleteUser={handleDeleteUser}
        dictionary={dictionary}
      />
    </motion.div>
  );
};

export default UsersTabContent;
