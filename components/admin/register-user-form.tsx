"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2, User, Mail, Lock, ShieldCheck } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface RegisterUserFormProps {
  onSubmit: (data: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error?: string;
  dictionary: {
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
}

// Swiss design-inspired animation variants
const swissEase = [0.23, 1, 0.32, 1];

const formItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.5,
      ease: swissEase,
    },
  }),
};

export const RegisterUserForm: React.FC<RegisterUserFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  error,
  dictionary,
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors: {
      username?: string;
      email?: string;
      password?: string;
    } = {};

    if (!username.trim()) {
      errors.username = "Username is required";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Submit if valid
    await onSubmit({ username, email, password, role });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-4"
      initial="hidden"
      animate="visible"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive" className="border-l-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div variants={formItemVariants} custom={0} className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">
          {dictionary.form.username}
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
          <Input
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setFormErrors({ ...formErrors, username: undefined });
            }}
            className={cn(
              "pl-10 transition-all duration-200 focus-visible:ring-offset-2",
              formErrors.username ? "border-red-500 focus:ring-red-500/20" : "",
              "bg-muted/30 focus:bg-background"
            )}
            required
          />
        </div>
        {formErrors.username && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-500 mt-1"
          >
            {formErrors.username}
          </motion.p>
        )}
      </motion.div>

      <motion.div variants={formItemVariants} custom={1} className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          {dictionary.form.email}
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <Mail className="h-4 w-4" />
          </div>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFormErrors({ ...formErrors, email: undefined });
            }}
            className={cn(
              "pl-10 transition-all duration-200 focus-visible:ring-offset-2",
              formErrors.email ? "border-red-500 focus:ring-red-500/20" : "",
              "bg-muted/30 focus:bg-background"
            )}
            required
          />
        </div>
        {formErrors.email && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-500 mt-1"
          >
            {formErrors.email}
          </motion.p>
        )}
      </motion.div>

      <motion.div variants={formItemVariants} custom={2} className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          {dictionary.form.password}
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFormErrors({ ...formErrors, password: undefined });
            }}
            className={cn(
              "pl-10 transition-all duration-200 focus-visible:ring-offset-2",
              formErrors.password ? "border-red-500 focus:ring-red-500/20" : "",
              "bg-muted/30 focus:bg-background"
            )}
            required
          />
        </div>
        {formErrors.password && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-500 mt-1"
          >
            {formErrors.password}
          </motion.p>
        )}
      </motion.div>

      <motion.div variants={formItemVariants} custom={3} className="space-y-2">
        <Label htmlFor="role" className="text-sm font-medium">
          {dictionary.form.role}
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <Select value={role} onValueChange={(value) => setRole(value)}>
            <SelectTrigger className="pl-10 bg-muted/30 focus:bg-background transition-all duration-200">
              <SelectValue placeholder={dictionary.form.selectRole} />
            </SelectTrigger>
            <SelectContent>
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SelectItem
                  value="user"
                  className="hover:bg-muted/30 transition-colors"
                >
                  {dictionary.form.userRole}
                </SelectItem>
                <SelectItem
                  value="admin"
                  className="hover:bg-muted/30 transition-colors"
                >
                  {dictionary.form.adminRole}
                </SelectItem>
              </motion.div>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div variants={formItemVariants} custom={4}>
        <DialogFooter className="flex justify-between space-x-2 mt-6">
          <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="font-medium border-border"
            >
              {dictionary.cancel}
            </Button>
          </motion.div>

          <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}>
            <Button type="submit" disabled={isLoading} className="font-medium">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {dictionary.submit}
            </Button>
          </motion.div>
        </DialogFooter>
      </motion.div>
    </motion.form>
  );
};
