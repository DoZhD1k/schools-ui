"use client";

import { motion, MotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import * as React from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const MAX_SIZE = 80;
const MIN_SIZE = 40;
const MAX_DISTANCE = 160;

export function ThemeToggle({
  mouseX,
  mouseY,
  isHovering,
  isDesktop,
  isAnimating, // Добавляем новый параметр
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  isHovering: MotionValue<boolean>;
  isDesktop: boolean;
  isAnimating?: boolean; // Делаем опциональным для обратной совместимости
}) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [hover, setHover] = React.useState(false);
  const [localAnimating, setLocalAnimating] = React.useState(false);

  const { theme, setTheme } = useTheme();

  // Комбинируем локальное состояние анимации с глобальным
  const isCurrentlyAnimating = isAnimating || localAnimating;

  React.useEffect(() => {
    if (!isDesktop) {
      return;
    }

    const unsubscribe = isHovering.on("change", (latest) => {
      setHover(latest);
    });

    return () => unsubscribe();
  }, [isHovering, isDesktop]);

  const distance = useTransform([mouseX, mouseY], ([x, y]) => {
    if (!ref.current || !hover || !isDesktop) return MAX_DISTANCE;
    const rect = ref.current.getBoundingClientRect();
    const itemCenterX = rect.left + rect.width / 2;
    const itemCenterY = rect.top + rect.height / 2;
    return Math.sqrt(
      Math.pow((x as number) - itemCenterX, 2) +
        Math.pow((y as number) - itemCenterY, 2)
    );
  });

  const size = useTransform(distance, [0, MAX_DISTANCE], [MAX_SIZE, MIN_SIZE]);
  const smoothSize = useSpring(size, {
    damping: 20,
    stiffness: 200,
    mass: 0.5,
  });

  const springY = useSpring(0, {
    stiffness: 300,
    damping: 15,
    mass: 0.5,
  });

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (isCurrentlyAnimating) return; // Предотвращаем нажатие во время анимации

    setLocalAnimating(true);
    springY.set(-12);

    // Используем requestAnimationFrame и setTimeout для более плавной анимации
    requestAnimationFrame(() => {
      setTimeout(() => {
        springY.set(0);
        setTheme(theme === "light" ? "dark" : "light");

        // Небольшая задержка перед сбросом флага анимации
        setTimeout(() => {
          setLocalAnimating(false);
        }, 200);
      }, 150);
    });
  }

  // Calculate appropriate size for mobile
  const mobileSize = isDesktop ? smoothSize : 42; // Fixed size on mobile

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            ref={ref}
            aria-label="Toggle theme"
            disabled={isCurrentlyAnimating}
            className="relative flex items-center justify-center overflow-hidden rounded-full shadow-lg"
            style={{
              width: mobileSize,
              height: mobileSize,
              y: springY,
              willChange: "transform", // Оптимизация для GPU-ускорения
              backfaceVisibility: "hidden",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: {
                delay: 0.3, // Задержка после появления меню
                duration: 0.2,
                ease: "easeOut",
              },
            }}
            whileHover={{
              scale: 1.15,
              background: "rgba(255, 255, 255, 0.1)",
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
          >
            <div className="footer-item-background"></div>
            <motion.svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              color="hsl(0 0% 49.4%)"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              stroke="currentColor"
              className="pointer-events-none h-1/2 w-1/2"
              initial={{ rotate: theme === "light" ? 90 : 40 }}
              animate={{ rotate: theme === "light" ? 90 : 40 }}
              transition={{
                duration: 0.3,
                ease: [0.16, 1, 0.3, 1],
                type: "tween", // Используем tween для более предсказуемой анимации
              }}
            >
              <mask id="myMask2">
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="100%"
                  fill="white"
                ></rect>
                <motion.circle
                  r="9"
                  fill="black"
                  animate={{
                    cx: theme === "dark" ? "50%" : "100%",
                    cy: theme === "dark" ? "23%" : "0%",
                  }}
                  transition={{
                    duration: 0.3,
                    type: "tween",
                    ease: "easeOut", // Простая кривая для устранения лишних эффектов
                  }}
                ></motion.circle>
              </mask>
              <motion.circle
                cx="12"
                cy="12"
                fill="hsl(0 0% 49.4%)"
                mask="url(#myMask2)"
                animate={{ r: theme === "light" ? 5 : 9 }}
                transition={{
                  duration: 0.3,
                  type: "tween",
                  ease: "easeOut",
                }}
              ></motion.circle>
              <motion.g
                stroke="currentColor"
                animate={{ opacity: theme === "dark" ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </motion.g>
            </motion.svg>

            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  theme === "light"
                    ? "radial-gradient(circle, rgba(17, 24, 39, 0.4) 0%, rgba(17, 24, 39, 0) 70%)"
                    : "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
              }}
            />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent
          side={isDesktop ? "left" : "bottom"}
          className="footer-item-label whitespace-pre rounded-md border border-gray-200 bg-gray-100 px-4 py-2 text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-neutral-300"
        >
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Toggle appearance
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
