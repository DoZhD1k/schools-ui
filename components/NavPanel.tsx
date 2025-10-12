// "use client";

// import {
//   motion,
//   MotionValue,
//   useMotionValue,
//   useSpring,
//   useTransform,
//   AnimatePresence,
// } from "framer-motion";
// import { usePathname } from "next/navigation";
// import * as React from "react";
// import { useTheme } from "next-themes";

// import {
//   Home,
//   MapPinned,
//   Shield,
//   Menu,
//   X,
//   School,
//   Trophy,
//   ChartColumn,
//   UserX,
// } from "lucide-react";

// import { ThemeToggle } from "@/components/theme-toggle";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
//   TooltipProvider,
// } from "@/components/ui/tooltip";
// import { useMediaQuery } from "@/hooks/use-media-query";
// import { useMounted } from "@/hooks/use-mounted";
// import { useAuth } from "@/contexts/auth-context";

// const MAX_SIZE = 80;
// const MIN_SIZE = 40;
// const MAX_DISTANCE = 160;

// export function NavPanel() {
//   const pathname = usePathname();
//   const { isAdmin } = useAuth();
//   const [isMenuOpen, setIsMenuOpen] = React.useState(false);
//   // Добавляем состояние для отслеживания процесса анимации
//   const [isAnimating, setIsAnimating] = React.useState(false);
//   const menuRef = React.useRef<HTMLDivElement>(null);
//   const buttonRef = React.useRef<HTMLButtonElement>(null);

//   const isDesktop = useMediaQuery("(min-width: 768px)");
//   const mounted = useMounted();

//   // Динамически формируем меню в зависимости от роли пользователя
//   const itemGroups = React.useMemo(() => {
//     const mainGroup = [
//       {
//         label: "Главная",
//         href: "/ru/dashboard",
//         icon: Home,
//         description: "",
//         external: false,
//       },
//       {
//         label: "Рейтинг школ",
//         href: "/ru/schools/rating",
//         icon: Trophy,
//         description: "",
//         external: false,
//       },
//       {
//         label: "Организации образования",
//         href: "/ru/schools/organizations",
//         icon: School,
//         description: "",
//         external: false,
//       },
//       // {
//       //   label: "Анализ рейтингов",
//       //   href: "/ru/schools/analytics",
//       //   icon: ChartColumn,
//       //   description: "",
//       //   external: false,
//       // },
//       {
//         label: "Карта школ",
//         href: "/ru/map",
//         icon: MapPinned,
//         description: "",
//         external: false,
//       },
//       // {
//       //   label: "Прогноз дефицита мест",
//       //   href: "/ru/schools/deficit",
//       //   icon: UserX,
//       //   description: "",
//       //   external: false,
//       // },
//     ];

//     // Добавляем пункт Админка только для пользователей с ролью admin
//     if (isAdmin) {
//       mainGroup.push({
//         label: "Админка",
//         href: "/ru/admin",
//         icon: Shield,
//         description: "",
//         external: false,
//       });
//     }

//     return [mainGroup];
//     // Добавляем isAdmin в зависимости, чтобы меню обновлялось при изменении роли
//   }, [isAdmin]);

//   const mouseX = useMotionValue(0);
//   const mouseY = useMotionValue(0);
//   const isHovering = useMotionValue(false);

//   // Обработка клика вне меню
//   React.useEffect(() => {
//     if (!isDesktop) {
//       const handleClickOutside = (event: MouseEvent) => {
//         if (
//           menuRef.current &&
//           !menuRef.current.contains(event.target as Node) &&
//           buttonRef.current &&
//           !buttonRef.current.contains(event.target as Node) &&
//           !isAnimating // Не закрываем во время анимации
//         ) {
//           handleMenuToggle(false);
//         }
//       };

//       if (isMenuOpen) {
//         document.addEventListener("mousedown", handleClickOutside);
//       }

//       return () => {
//         document.removeEventListener("mousedown", handleClickOutside);
//       };
//     }
//   }, [isMenuOpen, isDesktop, isAnimating]);

//   // Функция для контроля состояния меню с отслеживанием анимации
//   const handleMenuToggle = React.useCallback(
//     (state: boolean) => {
//       if (isAnimating) return; // Блокируем множественные клики во время анимации

//       setIsAnimating(true);
//       setIsMenuOpen(state);

//       // Сбрасываем флаг анимации после завершения
//       const timeout = setTimeout(() => {
//         setIsAnimating(false);
//       }, 400); // Немного больше, чем длительность анимации

//       return () => clearTimeout(timeout);
//     },
//     [isAnimating]
//   );

//   const handleMouseMove = React.useCallback(
//     (e: React.MouseEvent) => {
//       if (isDesktop) {
//         mouseX.set(e.clientX);
//         mouseY.set(e.clientY);
//         isHovering.set(true);
//       }
//     },
//     [mouseX, mouseY, isHovering, isDesktop]
//   );

//   const handleMouseLeave = React.useCallback(() => {
//     isHovering.set(false);
//   }, [isHovering]);

//   // Варианты анимации для плавного перехода
//   const menuVariants = {
//     hidden: isDesktop
//       ? { opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } }
//       : { x: 70, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
//     visible: isDesktop
//       ? { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }
//       : { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
//   };

//   if (!mounted) {
//     return null;
//   }

//   return (
//     <>
//       {/* Кнопка для мобильного меню */}
//       {!isDesktop && (
//         <motion.button
//           ref={buttonRef}
//           className="fixed right-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[hsl(0_0%_100%_/_0.077)] bg-background shadow-lg"
//           onClick={() => handleMenuToggle(!isMenuOpen)}
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.95 }}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.2 }}
//           disabled={isAnimating} // Блокируем кнопку во время анимации
//         >
//           <AnimatePresence mode="wait" initial={false}>
//             <motion.div
//               key={isMenuOpen ? "close" : "menu"}
//               initial={{ opacity: 0, rotate: isMenuOpen ? -90 : 90 }}
//               animate={{ opacity: 1, rotate: 0 }}
//               exit={{ opacity: 0, rotate: isMenuOpen ? 90 : -90 }}
//               transition={{ duration: 0.2 }}
//             >
//               {isMenuOpen ? (
//                 <X className="h-6 w-6" />
//               ) : (
//                 <Menu className="h-6 w-6" />
//               )}
//             </motion.div>
//           </AnimatePresence>
//         </motion.button>
//       )}

//       {/* Меню навигации с улучшенной анимацией */}
//       <AnimatePresence initial={false} mode="sync">
//         {(isDesktop || isMenuOpen) && (
//           <motion.div
//             ref={menuRef}
//             initial="hidden"
//             animate="visible"
//             exit="hidden"
//             variants={menuVariants}
//             onAnimationStart={() => setIsAnimating(true)}
//             onAnimationComplete={() => setIsAnimating(false)}
//             className="fixed top-[25%] z-40 flex h-auto w-[58px] flex-col items-center rounded-full border border-[hsl(0_0%_100%_/_0.077)] bg-background py-2 shadow-lg max-sm:right-2 max-sm:top-[25%] sm:right-4 sm:h-auto sm:translate-y-0"
//             style={{
//               position: "fixed",
//               willChange: "transform, opacity", // Оптимизация для плавной анимации
//               backfaceVisibility: "hidden", // Предотвращает мигание в некоторых браузерах
//             }}
//             onMouseMove={handleMouseMove}
//             onMouseLeave={handleMouseLeave}
//           >
//             <div className="flex h-full w-full flex-col items-center gap-2 px-2 max-sm:overflow-y-auto max-sm:overflow-x-hidden max-sm:py-2">
//               {itemGroups.map((group, groupIndex) => (
//                 <React.Fragment key={groupIndex}>
//                   {groupIndex > 0 && <hr className="footer-hr-vertical" />}
//                   {group.map((item, itemIndex) => {
//                     const globalIndex =
//                       itemGroups.slice(0, groupIndex).flat().length + itemIndex;
//                     return (
//                       <FooterItem
//                         key={`${groupIndex}-${itemIndex}`}
//                         item={item}
//                         index={globalIndex}
//                         mouseX={mouseX}
//                         mouseY={mouseY}
//                         isHovering={isHovering}
//                         isActive={pathname === item.href}
//                         isDesktop={isDesktop}
//                         isAnimating={isAnimating}
//                       />
//                     );
//                   })}
//                 </React.Fragment>
//               ))}

//               <hr className="footer-hr-vertical" />

//               <ThemeToggle
//                 mouseX={mouseX}
//                 mouseY={mouseY}
//                 isHovering={isHovering}
//                 isDesktop={isDesktop}
//                 isAnimating={isAnimating}
//               />
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

// function FooterItem({
//   item,
//   index,
//   mouseX,
//   mouseY,
//   isHovering,
//   isActive,
//   isDesktop,
//   isAnimating,
// }: {
//   item: {
//     label: string;
//     href: string;
//     icon: React.ComponentType<any>;
//     description: string;
//     external: boolean;
//   };
//   index: number;
//   mouseX: MotionValue<number>;
//   mouseY: MotionValue<number>;
//   isHovering: MotionValue<boolean>;
//   isActive: boolean;
//   isDesktop: boolean;
//   isAnimating: boolean;
// }) {
//   const ref = React.useRef<HTMLAnchorElement>(null);
//   const [hover, setHover] = React.useState(false);
//   const { theme } = useTheme();

//   // Задержка для стаггеред-анимации
//   const delay = index * 0.035;

//   React.useEffect(() => {
//     if (!isDesktop) return;
//     const unsubscribe = isHovering.on("change", (latest) => {
//       setHover(latest);
//     });
//     return () => unsubscribe();
//   }, [isHovering, isDesktop]);

//   const distance = useTransform([mouseX, mouseY], ([x, y]) => {
//     if (!ref.current || !hover || !isDesktop) return MAX_DISTANCE;
//     const rect = ref.current.getBoundingClientRect();
//     const itemCenterX = rect.left + rect.width / 2;
//     const itemCenterY = rect.top + rect.height / 2;
//     return Math.sqrt(
//       Math.pow((x as number) - itemCenterX, 2) +
//         Math.pow((y as number) - itemCenterY, 2)
//     );
//   });

//   const size = useTransform(distance, [0, MAX_DISTANCE], [MAX_SIZE, MIN_SIZE]);
//   // Оптимизация spring анимации для уменьшения дрожания
//   const smoothSize = useSpring(size, {
//     damping: 20,
//     stiffness: 200,
//     mass: 0.5,
//   });
//   const springY = useSpring(0, {
//     stiffness: 300,
//     damping: 15,
//     mass: 0.5,
//   });

//   const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
//     e.preventDefault();
//     if (isAnimating) return;

//     springY.set(-12);

//     // Оптимизация перехода
//     setTimeout(() => {
//       springY.set(0);
//       window.location.href = item.href;
//     }, 200);
//   };

//   // Fixed size for mobile and desktop
//   const mobileSize = isDesktop ? smoothSize : 42;

//   return (
//     <TooltipProvider>
//       <Tooltip>
//         <TooltipTrigger asChild>
//           <motion.a
//             ref={ref}
//             href={item.href}
//             className="relative flex items-center justify-center overflow-hidden rounded-full shadow-lg"
//             aria-label={item.label}
//             rel={item.external ? "noopener noreferrer" : undefined}
//             target={item.external ? "_blank" : undefined}
//             style={{
//               width: mobileSize,
//               height: mobileSize,
//               y: springY,
//               willChange: "transform", // Оптимизация для GPU-ускорения
//               backfaceVisibility: "hidden",
//             }}
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{
//               opacity: 1,
//               scale: 1,
//               transition: {
//                 delay,
//                 duration: 0.2,
//                 ease: "easeOut",
//               },
//             }}
//             whileHover={{
//               scale: 1.15,
//               background: "rgba(255, 255, 255, 0.1)",
//               transition: { duration: 0.2, ease: "easeOut" },
//             }}
//             whileTap={{ scale: 0.95 }}
//             onClick={handleClick}
//           >
//             <div className="footer-item-background"></div>
//             <item.icon className="pointer-events-none h-1/2 w-1/2" />
//             {isActive && (
//               <motion.div
//                 className="absolute -right-1.5 z-[1] h-1 w-1 rounded-full bg-zinc-700 opacity-100"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.3 }}
//               />
//             )}

//             <motion.div
//               className="absolute inset-0 rounded-full"
//               style={{
//                 background:
//                   theme === "light"
//                     ? "radial-gradient(circle, rgba(17, 24, 39, 0.4) 0%, rgba(17, 24, 39, 0) 70%)" // gray-900
//                     : "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
//               }}
//             />
//           </motion.a>
//         </TooltipTrigger>
//         <TooltipContent
//           side={isDesktop ? "left" : "bottom"}
//           className="footer-item-label whitespace-pre rounded-md border border-gray-200 bg-gray-100 px-4 py-2 text-neutral-700 dark:border-neutral-900 dark:bg-neutral-800 dark:text-neutral-300"
//         >
//           <div className="flex flex-col gap-0.5">
//             <p className="text-sm font-medium">{item.label}</p>
//             {"description" in item && (
//               <p className="text-xs text-neutral-500 dark:text-neutral-400">
//                 {item.description}
//               </p>
//             )}
//           </div>
//         </TooltipContent>
//       </Tooltip>
//     </TooltipProvider>
//   );
// }
