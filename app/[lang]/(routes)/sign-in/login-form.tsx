"use client";

import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  motion,
  AnimatePresence,
  Variants,
  Transition,
  TargetAndTransition,
} from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import {
  useIsMobile,
  useDeviceType,
  useIsFoldableDisplay,
  cn,
} from "@/utils/responsive";
import { toast } from "sonner";
import { LoginFormProps } from "@/types/dictionary";

// Interface InputWithAnimationProps and LoginResponse definitions
interface InputWithAnimationProps {
  field: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    name: string;
    ref: React.Ref<HTMLInputElement>;
  };
  type?: string;
  placeholder: string;
}

interface LoginResponse {
  token: string;
  expires_in: number;
  message?: string;
}

export default function LoginForm({ dictionary }: LoginFormProps): JSX.Element {
  const { signIn } = dictionary;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setAccessToken } = useAuth();
  const [attempts, setAttempts] = useState<number>(0);
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

  // Responsive helpers
  const isMobile = useIsMobile();
  const deviceType = useDeviceType();
  const isFoldable = useIsFoldableDisplay();

  // Define the shape of our form schema with localized messages
  const formSchema = z.object({
    username: z
      .string()
      .min(3, { message: signIn.validation.username.min })
      .max(50, { message: signIn.validation.username.max })
      .regex(/^[a-zA-Z0-9_-]+$/, {
        message: signIn.validation.username.invalid,
      }),
    password: z
      .string()
      .min(3, { message: signIn.validation.password.min })
      .max(100, { message: signIn.validation.password.max }),
  });

  // Define types for form values
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Enhanced animation variants with Swiss design principles
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } },
  };

  const titleVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1], // Custom bezier curve for Swiss smoothness
      },
    },
  };

  const descVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.1,
      },
    },
  };

  const formFieldVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: (custom: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.2 + custom * 0.1,
      },
    }),
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.4,
      },
    },
    tap: { scale: 0.98 },
  };

  // Swiss design-inspired line animations
  const lineVariants: Variants = {
    hidden: { scaleX: 0, originX: 0 },
    visible: {
      scaleX: 1,
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const verticalLineVariants: Variants = {
    hidden: { scaleY: 0, originY: 0 },
    visible: {
      scaleY: 1,
      transition: {
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3,
      },
    },
  };

  useEffect(() => {
    // Restore form data from sessionStorage
    const savedData = sessionStorage.getItem("loginForm");
    if (savedData) {
      try {
        const { username } = JSON.parse(savedData) as { username: string };
        form.setValue("username", username);
      } catch (error) {
        console.error("Failed to parse saved form data:", error);
        // Clear corrupted data
        sessionStorage.removeItem("loginForm");
      }
    }
  }, [form]);

  async function onSubmit(values: FormValues): Promise<void> {
    if (attempts >= MAX_ATTEMPTS) {
      const lastAttempt = Number(
        localStorage.getItem("lastLoginAttempt") || "0"
      );
      if (Date.now() - lastAttempt < LOCKOUT_TIME) {
        toast.error(signIn.errors.tooManyAttempts, {
          description: signIn.errors.tryLater,
        });
        return;
      }
      setAttempts(0);
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        credentials: "include", // Important for cookies
      });

      const data = (await response.json()) as LoginResponse;

      if (response.ok) {
        setAccessToken(data.token, data.expires_in);

        // Save form data
        sessionStorage.setItem(
          "loginForm",
          JSON.stringify({ username: values.username })
        );

        toast.success(signIn.success.title, {
          description: signIn.success.description,
        });

        router.push("/");
      } else {
        throw new Error(data.message || signIn.errors.generic);
      }
    } catch (error) {
      setAttempts((prev) => prev + 1);
      localStorage.setItem("lastLoginAttempt", Date.now().toString());

      toast.error("Error", {
        description:
          error instanceof Error ? error.message : signIn.errors.generic,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const InputWithAnimation = ({
    field,
    type = "text",
    placeholder,
  }: InputWithAnimationProps): JSX.Element => {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isError] = useState<boolean>(false);
    const [hasValue, setHasValue] = useState<boolean>(Boolean(field.value));

    useEffect(() => {
      setHasValue(Boolean(field.value));
    }, [field.value]);

    // Either remove the function or use it where needed in your form validation
    const errorAnimation: TargetAndTransition = isError
      ? {
          x: [0, 5, -5, 5, -5, 0], // More subtle shake
          transition: { duration: 0.4 } as Transition,
        }
      : {};

    const styleAnimation: TargetAndTransition = {
      scale: isFocused ? 1.005 : 1, // More subtle scale
      boxShadow: isError
        ? "0 0 0 2px var(--destructive)"
        : isFocused
        ? "0 0 0 2px var(--ring)"
        : "none",
      borderColor: isError
        ? "var(--destructive)"
        : isFocused
        ? "var(--foreground)"
        : hasValue
        ? "var(--foreground)"
        : "var(--input)",
    };

    // Line animation below input (Swiss design element)
    const lineFocusAnimation: TargetAndTransition = {
      scaleX: isFocused || hasValue ? 1 : 0,
      backgroundColor: isError
        ? "var(--destructive)"
        : isFocused
        ? "var(--foreground)"
        : "var(--muted-foreground)",
      transition: { duration: 0.3 },
    };

    return (
      <motion.div animate={errorAnimation} className="space-y-1">
        <motion.div
          animate={styleAnimation}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          <Input
            className={cn(
              "px-4 text-base focus:ring-0 focus:border-foreground rounded-none border-[1px] border-input",
              deviceType === "mobile" ? "h-10" : "h-12"
            )}
            type={type}
            placeholder={placeholder}
            {...field}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              field.onChange(e);
              setHasValue(Boolean(e.target.value));
            }}
            style={{
              borderRadius: 0,
              WebkitBorderRadius: 0,
              MozBorderRadius: 0,
              outline: "none",
            }}
          />
          <motion.div
            className="h-0.5 w-full absolute -bottom-0.5 left-0 origin-left"
            initial={{ scaleX: hasValue ? 1 : 0 }}
            animate={lineFocusAnimation}
          />
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div
      className={cn(
        "px-4 sm:px-6 md:px-8 flex justify-center items-center min-h-[100dvh] relative overflow-hidden bg-background",
        isFoldable && "fold-device-adjustments"
      )}
    >
      {/* Swiss design decorative lines - responsive positioning */}
      <motion.div
        className={cn(
          "absolute h-px bg-foreground w-full opacity-70",
          isMobile ? "top-4 left-0 hidden" : "top-8 sm:top-12 left-0 block"
        )}
        initial="hidden"
        animate="visible"
        variants={lineVariants}
      />
      <motion.div
        className={cn(
          "absolute w-px bg-foreground h-full opacity-70",
          isMobile ? "hidden" : "top-0 left-4 sm:left-8 md:left-12 block"
        )}
        initial="hidden"
        animate="visible"
        variants={verticalLineVariants}
      />
      <motion.div
        className={cn(
          "absolute h-px bg-foreground w-full opacity-70",
          isMobile ? "hidden" : "bottom-8 sm:bottom-12 right-0 block"
        )}
        initial="hidden"
        animate="visible"
        variants={lineVariants}
      />
      <motion.div
        className={cn(
          "absolute w-px bg-foreground h-full opacity-70",
          isMobile ? "hidden" : "top-0 right-4 sm:right-8 md:right-12 block"
        )}
        initial="hidden"
        animate="visible"
        variants={verticalLineVariants}
      />

      {/* Mobile lines (simpler version) */}
      <motion.div
        className={cn(
          "absolute h-px bg-foreground w-1/3 opacity-70",
          isMobile ? "block top-4 left-4" : "hidden"
        )}
        initial="hidden"
        animate="visible"
        variants={lineVariants}
      />
      <motion.div
        className={cn(
          "absolute h-px bg-foreground w-1/3 opacity-70",
          isMobile ? "block bottom-4 right-4" : "hidden"
        )}
        initial="hidden"
        animate="visible"
        variants={lineVariants}
      />

      <AnimatePresence>
        <motion.div
          className={cn(
            "w-full mx-auto max-w-md space-y-6 relative z-10",
            deviceType === "mobile"
              ? "p-5"
              : deviceType === "tablet"
              ? "p-7"
              : "p-10",
            isFoldable && "max-w-sm p-4"
          )}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="space-y-3 text-left overflow-hidden mb-6 sm:mb-8">
            <motion.div
              className="w-12 sm:w-16 h-0.5 bg-foreground mb-3 sm:mb-4"
              variants={lineVariants}
            />
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground"
              variants={titleVariants}
            >
              {signIn.title}
            </motion.h1>
            <motion.p
              className="text-sm sm:text-base text-muted-foreground"
              variants={descVariants}
            >
              {signIn.description}
            </motion.p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 sm:space-y-6"
            >
              <motion.div
                variants={formFieldVariants}
                custom={0}
                initial="hidden"
                animate="visible"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-2 sm:space-y-3">
                      <FormLabel className="text-sm sm:text-base font-normal text-foreground">
                        {signIn.username}
                      </FormLabel>
                      <FormControl>
                        <InputWithAnimation
                          field={field}
                          placeholder="ivanov"
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-medium" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                variants={formFieldVariants}
                custom={1}
                initial="hidden"
                animate="visible"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2 sm:space-y-3">
                      <FormLabel className="text-sm sm:text-base font-normal text-foreground">
                        {signIn.password}
                      </FormLabel>
                      <FormControl>
                        <InputWithAnimation
                          field={field}
                          type="password"
                          placeholder="••••••••"
                        />
                      </FormControl>
                      <FormMessage className="text-xs font-medium" />
                    </FormItem>
                  )}
                />
              </motion.div>

              <motion.div
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileTap="tap"
                className="pt-1 sm:pt-2"
              >
                <Button
                  type="submit"
                  className="w-full h-10 sm:h-11 md:h-12 text-sm sm:text-base bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent transition-colors rounded-none"
                  disabled={isLoading}
                  style={{
                    borderRadius: 0,
                    WebkitBorderRadius: 0,
                    MozBorderRadius: 0,
                  }}
                >
                  {isLoading ? signIn.buttonLoading : signIn.button}
                </Button>
              </motion.div>
            </form>
          </Form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
