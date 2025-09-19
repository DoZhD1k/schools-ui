"use client";

import React, { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash, Lock, Unlock } from "lucide-react";
import { userList } from "@/types/admin";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// Default dictionary values
const defaultDictionary = {
  actions: {
    activate: "Activate",
    deactivate: "Deactivate",
    delete: "Delete",
  },
  deleteDialog: {
    title: "Delete User",
    description:
      "Are you sure you want to delete this user? This action cannot be undone.",
    cancel: "Cancel",
    confirm: "Delete",
  },
  table: {
    status: "Status",
    actions: "Actions",
  },
};

interface UsersTableProps {
  users: userList[];
  loading: boolean;
  onActivateUser: (userId: number) => Promise<void>;
  onDeactivateUser: (userId: number) => Promise<void>;
  onDeleteUser: (userId: number) => Promise<void>;
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

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  onActivateUser,
  onDeactivateUser,
  onDeleteUser,
  dictionary,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [processingUser, setProcessingUser] = useState<number | null>(null);

  // Merge the provided dictionary with default values
  const dict = {
    ...dictionary,
    actions: {
      ...defaultDictionary.actions,
      ...dictionary.actions,
    },
    deleteDialog: {
      ...defaultDictionary.deleteDialog,
      ...dictionary.deleteDialog,
    },
    table: {
      ...dictionary.table,
      status: dictionary.table.status || defaultDictionary.table.status,
      actions: dictionary.table.actions || defaultDictionary.table.actions,
    },
  };

  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete !== null) {
      setProcessingUser(userToDelete);
      await onDeleteUser(userToDelete);
      setProcessingUser(null);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const handleActivate = async (userId: number) => {
    setProcessingUser(userId);
    await onActivateUser(userId);
    setProcessingUser(null);
  };

  const handleDeactivate = async (userId: number) => {
    setProcessingUser(userId);
    await onDeactivateUser(userId);
    setProcessingUser(null);
  };

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

  if (users.length === 0) {
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
    <>
      <ScrollArea className="h-[400px] rounded-md border border-muted/20">
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
                  {dictionary.table.username}
                </TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70">
                  {dictionary.table.role}
                </TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70">
                  {dict.table.status}
                </TableHead>
                <TableHead className="font-medium text-xs uppercase tracking-wider text-muted-foreground/70 text-right">
                  {dict.table.actions}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  className={cn(
                    "border-b border-muted/10 transition-colors",
                    "hover:bg-muted/5",
                    !user.isActive && "opacity-70"
                  )}
                  whileHover={{ backgroundColor: "rgba(var(--muted), 0.1)" }}
                >
                  <TableCell className="font-mono text-sm">{user.id}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-sm text-xs font-medium",
                        user.role === "admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted/30 text-muted-foreground"
                      )}
                    >
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "px-2 py-1 rounded-sm text-xs font-medium",
                        user.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      )}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {user.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivate(user.id)}
                        disabled={processingUser === user.id}
                        className="h-8 px-2 text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/50"
                      >
                        {processingUser === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Lock className="h-4 w-4 mr-1" />
                        )}
                        {dict.actions.deactivate}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivate(user.id)}
                        disabled={processingUser === user.id}
                        className="h-8 px-2 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950/50"
                      >
                        {processingUser === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Unlock className="h-4 w-4 mr-1" />
                        )}
                        {dict.actions.activate}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(user.id)}
                      disabled={processingUser === user.id}
                      className="h-8 px-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/50"
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      {dict.actions.delete}
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </ScrollArea>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dict.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {dict.deleteDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{dict.deleteDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {processingUser !== null ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash className="mr-2 h-4 w-4" />
              )}
              {dict.deleteDialog.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
