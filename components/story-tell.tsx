// "use client";

// import { useState, useEffect, useRef, JSX } from "react";
// import {
//   motion,
//   useScroll,
//   useTransform,
//   Variants,
//   useMotionValue,
// } from "framer-motion";
// import { useIsMobile, cn } from "@/utils/responsive";
// import { Plus, PlayCircle, Maximize2 } from "lucide-react";
// import { StoryTellingProps } from "@/types/dictionary";
// import { ThemeToggle } from "@/components/theme-toggle";
// import { useMediaQuery } from "@/hooks/use-media-query";
// // import { useMounted } from "@/hooks/use-mounted";

// // Define the dictionary type to match our JSON structure

// export default function Storytelling({
//   dictionary,
// }: StoryTellingProps): JSX.Element {
//   const [activeSection, setActiveSection] = useState<string>("hero");
//   const { scrollY } = useScroll();
//   const isMobile = useIsMobile();
//   const heroRef = useRef<HTMLDivElement>(null);
//   const aboutRef = useRef<HTMLDivElement>(null);
//   const servicesRef = useRef<HTMLDivElement>(null);
//   const caseStudiesRef = useRef<HTMLDivElement>(null);
//   const isDesktop = useMediaQuery("(min-width: 768px)");
//   // const mounted = useMounted();
//   const mouseX = useMotionValue(0);
//   const mouseY = useMotionValue(0);
//   const isHovering = useMotionValue(false);
//   // Swiss design-inspired transition
//   const swissEase = [0.22, 1, 0.36, 1];

//   // Scroll-triggered animations
//   const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
//   const headerY = useTransform(scrollY, [0, 100], [0, -8]);

//   // Track scroll position to update active section
//   useEffect(() => {
//     const handleScroll = () => {
//       const scrollPosition = window.scrollY + 200;

//       const sections = [
//         { ref: heroRef, id: "hero" },
//         { ref: aboutRef, id: "about" },
//         { ref: servicesRef, id: "services" },
//         { ref: caseStudiesRef, id: "case-studies" },
//       ];

//       for (let i = sections.length - 1; i >= 0; i--) {
//         const { ref, id } = sections[i];
//         if (ref.current && scrollPosition >= ref.current.offsetTop) {
//           setActiveSection(id);
//           break;
//         }
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Access the storytelling section of the dictionary
//   const t = dictionary.storytelling;

//   // Swiss design-inspired animation variants
//   const containerVariants: Variants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.15,
//         delayChildren: 0.2,
//       },
//     },
//   };

//   const titleVariants: Variants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         duration: 0.7,
//         ease: swissEase,
//       },
//     },
//   };

//   const lineVariants: Variants = {
//     hidden: { scaleX: 0, originX: 0 },
//     visible: {
//       scaleX: 1,
//       transition: {
//         duration: 1.2,
//         ease: swissEase,
//       },
//     },
//   };

//   const verticalLineVariants: Variants = {
//     hidden: { scaleY: 0, originY: 0 },
//     visible: {
//       scaleY: 1,
//       transition: {
//         duration: 1,
//         ease: swissEase,
//         delay: 0.3,
//       },
//     },
//   };

//   const itemVariants: Variants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: (custom: number) => ({
//       y: 0,
//       opacity: 1,
//       transition: {
//         duration: 0.5,
//         ease: swissEase,
//         delay: 0.1 + custom * 0.1,
//       },
//     }),
//   };

//   const fadeInUpVariants: Variants = {
//     hidden: { opacity: 0, y: 30 },
//     visible: (custom: number) => ({
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.6,
//         ease: swissEase,
//         delay: custom * 0.1,
//       },
//     }),
//   };
//   // const handleMouseMove = React.useCallback(
//   //   (e: React.MouseEvent) => {
//   //     if (isDesktop) {
//   //       mouseX.set(e.clientX);
//   //       mouseY.set(e.clientY);
//   //       isHovering.set(true);
//   //     }
//   //   },
//   //   [mouseX, mouseY, isHovering, isDesktop]
//   // );

//   const sectionDivider = (position: "top" | "bottom") => (
//     <div
//       className={`relative w-full ${position === "top" ? "mb-16" : "my-16"}`}
//     >
//       <motion.div
//         className="h-px w-full bg-foreground/40"
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true, amount: 0.8 }}
//         variants={lineVariants}
//       />
//       <motion.div
//         className={`absolute ${
//           position === "top" ? "-bottom-2" : "-top-2"
//         } left-1/2 w-4 h-4 border border-foreground/40 bg-background -translate-x-1/2 rotate-45`}
//         initial={{ opacity: 0, scale: 0 }}
//         whileInView={{ opacity: 1, scale: 1 }}
//         viewport={{ once: true }}
//         transition={{ duration: 0.5, delay: 0.6, ease: swissEase }}
//       />
//     </div>
//   );

//   return (
//     <div className="bg-background text-foreground">
//       {/* Fixed Swiss design decorative lines */}
//       <motion.div
//         className={cn(
//           "fixed h-px bg-foreground/30 w-full z-10",
//           isMobile ? "top-4 left-0 hidden" : "top-8 left-0 block"
//         )}
//         initial="hidden"
//         animate="visible"
//         variants={lineVariants}
//       />
//       <motion.div
//         className={cn(
//           "fixed w-px bg-foreground/30 h-full z-10",
//           isMobile ? "hidden" : "top-0 left-8 sm:left-12 block"
//         )}
//         initial="hidden"
//         animate="visible"
//         variants={verticalLineVariants}
//       />

//       <motion.div
//         className={cn(
//           "fixed w-px bg-foreground/30 h-full z-10",
//           isMobile ? "hidden" : "top-0 right-8 sm:right-12 block"
//         )}
//         initial="hidden"
//         animate="visible"
//         variants={verticalLineVariants}
//       />

//       {/* Header */}
//       <motion.header
//         className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-12 py-5 bg-background/80 backdrop-blur-md"
//         style={{ opacity: headerOpacity, y: headerY }}
//       >
//         <div className="max-w-7xl mx-auto flex justify-between items-center">
//           <motion.a
//             href="#"
//             className="text-xl font-bold"
//             whileHover={{ x: 3 }}
//             transition={{ duration: 0.2 }}
//           >
//             {t.header.brand}
//           </motion.a>
//           {/* Navigation - Desktop */}
//           <nav className="hidden md:flex items-center space-x-8">
//             {[
//               { id: "hero", label: t.navigation.hero },
//               { id: "about", label: t.navigation.about },
//               { id: "services", label: t.navigation.services },
//               { id: "case-studies", label: t.navigation.caseStudies },
//             ].map((section, index) => (
//               <motion.a
//                 key={section.id}
//                 href={`#${section.id}`}
//                 className={cn(
//                   "text-sm uppercase tracking-wide relative px-2 py-1",
//                   activeSection === section.id
//                     ? "text-foreground"
//                     : "text-foreground/70"
//                 )}
//                 whileHover={{ color: "var(--foreground)" }}
//                 custom={index}
//                 variants={itemVariants}
//                 initial="hidden"
//                 animate="visible"
//               >
//                 {section.label}
//                 {activeSection === section.id && (
//                   <motion.div
//                     className="absolute bottom-0 left-0 h-0.5 bg-foreground w-full"
//                     layoutId="activeSection"
//                     transition={{ duration: 0.3, ease: swissEase }}
//                   />
//                 )}
//               </motion.a>
//             ))}
//             <motion.a
//               href="/sign-in"
//               className="text-sm text-foreground/70 border border-foreground/20 px-3 py-1.5 ml-4 hover:border-foreground/40 transition-colors duration-200"
//               whileHover={{ y: -2 }}
//               transition={{ duration: 0.2 }}
//               variants={itemVariants}
//               custom={4}
//               initial="hidden"
//               animate="visible"
//             >
//               {t.cta.alreadyHaveAccess}
//             </motion.a>{" "}
//             <ThemeToggle
//               mouseX={mouseX}
//               mouseY={mouseY}
//               isHovering={isHovering}
//               isDesktop={isDesktop}
//             />
//           </nav>{" "}
//           {/* Mobile menu button */}
//           <motion.button
//             className="md:hidden flex flex-col space-y-1.5"
//             whileTap={{ scale: 0.9 }}
//           >
//             <span className="block w-6 h-0.5 bg-foreground" />
//             <span className="block w-6 h-0.5 bg-foreground" />
//           </motion.button>{" "}
//         </div>
//       </motion.header>

//       {/* Hero Section */}
//       <section
//         ref={heroRef}
//         id="hero"
//         className="min-h-[95vh] flex flex-col justify-center relative overflow-hidden pt-20"
//       >
//         <div className="max-w-7xl mx-auto px-6 sm:px-12 py-20 md:py-32">
//           <motion.div
//             className="grid md:grid-cols-5 gap-8 md:gap-12"
//             variants={containerVariants}
//             initial="hidden"
//             animate="visible"
//           >
//             <div className="md:col-span-3 space-y-8">
//               <motion.div
//                 variants={lineVariants}
//                 className="w-16 h-0.5 bg-foreground"
//               />

//               <motion.h1
//                 variants={titleVariants}
//                 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold leading-tight tracking-tighter"
//               >
//                 {t.hero.tagline} <br />
//                 <span className="text-primary">{t.hero.highlight}</span>
//               </motion.h1>

//               <motion.p
//                 variants={itemVariants}
//                 custom={1}
//                 className="text-lg md:text-xl text-foreground/80 max-w-xl"
//               >
//                 {t.hero.description}
//               </motion.p>

//               <motion.div
//                 variants={itemVariants}
//                 custom={2}
//                 className="flex flex-col sm:flex-row gap-4"
//               >
//                 <motion.a
//                   href="#about"
//                   className="px-8 py-4 bg-foreground text-background text-sm uppercase tracking-wider inline-flex items-center justify-center hover:bg-foreground/90"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   transition={{ duration: 0.2 }}
//                 >
//                   {t.hero.cta.primary}
//                 </motion.a>

//                 <motion.a
//                   href="#services"
//                   className="px-8 py-4 border border-foreground text-foreground text-sm uppercase tracking-wider inline-flex items-center justify-center hover:bg-foreground/5"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   transition={{ duration: 0.2 }}
//                 >
//                   {t.hero.cta.secondary}
//                 </motion.a>
//               </motion.div>
//             </div>

//             <motion.div
//               className="md:col-span-2 relative"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.8, delay: 0.6 }}
//             >
//               <div className="relative h-full w-full min-h-[300px] md:min-h-0">
//                 {/* Abstract grid pattern */}
//                 <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
//                   {Array.from({ length: 16 }).map((_, i) => (
//                     <motion.div
//                       key={i}
//                       className="border border-foreground/10"
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       transition={{ delay: 0.8 + i * 0.03, duration: 0.5 }}
//                     />
//                   ))}
//                 </div>

//                 {/* Data visualization elements */}
//                 <motion.div
//                   className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-primary/20"
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{ delay: 1, duration: 0.6, ease: swissEase }}
//                 />

//                 <motion.div
//                   className="absolute top-1/2 right-1/4 w-24 h-24 bg-foreground/10"
//                   initial={{ scale: 0, rotate: 45 }}
//                   animate={{ scale: 1, rotate: 0 }}
//                   transition={{ delay: 1.2, duration: 0.6, ease: swissEase }}
//                 />

//                 <motion.div
//                   className="absolute bottom-1/4 left-1/3 w-12 h-12 rounded-full border-4 border-primary/40"
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{ delay: 1.4, duration: 0.6, ease: swissEase }}
//                 />

//                 <motion.svg
//                   className="absolute inset-0 w-full h-full"
//                   viewBox="0 0 100 100"
//                   xmlns="http://www.w3.org/2000/svg"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 0.8 }}
//                   transition={{ delay: 1.6, duration: 0.8 }}
//                 >
//                   <motion.path
//                     d="M10,50 Q30,30 50,50 T90,50"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeOpacity="0.2"
//                     strokeWidth="0.5"
//                     initial={{ pathLength: 0 }}
//                     animate={{ pathLength: 1 }}
//                     transition={{ duration: 1.5, delay: 1.6, ease: swissEase }}
//                   />
//                   <motion.path
//                     d="M10,70 Q30,50 50,70 T90,70"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeOpacity="0.2"
//                     strokeWidth="0.5"
//                     initial={{ pathLength: 0 }}
//                     animate={{ pathLength: 1 }}
//                     transition={{ duration: 1.5, delay: 1.8, ease: swissEase }}
//                   />
//                 </motion.svg>
//               </div>
//             </motion.div>
//           </motion.div>
//         </div>

//         <motion.div
//           className="absolute bottom-8 left-1/2 -translate-x-1/2"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 2, duration: 0.8 }}
//         >
//           <motion.div
//             animate={{ y: [0, 8, 0] }}
//             transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
//           >
//             <svg
//               width="24"
//               height="24"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
//             </svg>
//           </motion.div>
//         </motion.div>
//       </section>

//       {sectionDivider("top")}

//       {/* About Section */}
//       <section
//         ref={aboutRef}
//         id="about"
//         className="py-20 md:py-28 px-6 sm:px-12"
//       >
//         <div className="max-w-7xl mx-auto">
//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.2 }}
//           >
//             <motion.div
//               variants={lineVariants}
//               className="w-16 h-0.5 bg-foreground mb-8"
//             />

//             <div className="grid md:grid-cols-2 gap-12 md:gap-16">
//               <div>
//                 <motion.h2
//                   variants={titleVariants}
//                   className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight"
//                 >
//                   {t.about.title}
//                 </motion.h2>

//                 <motion.p
//                   variants={fadeInUpVariants}
//                   custom={1}
//                   className="text-lg text-foreground/80 mb-6"
//                 >
//                   {t.about.intro}
//                   <span className="block mt-2 text-xl md:text-2xl italic">
//                     {t.about.question}
//                   </span>
//                 </motion.p>

//                 <motion.p
//                   variants={fadeInUpVariants}
//                   custom={2}
//                   className="text-foreground/80"
//                 >
//                   {t.about.description}
//                 </motion.p>
//               </div>

//               <div className="grid grid-cols-2 gap-6">
//                 {t.about.stats.map((stat, index) => (
//                   <motion.div
//                     key={index}
//                     variants={itemVariants}
//                     custom={index}
//                     className={cn(
//                       "p-6 border border-foreground/10",
//                       index === 0 && "bg-foreground/5"
//                     )}
//                   >
//                     <h3 className="text-3xl md:text-4xl font-bold mb-2">
//                       {stat.number}
//                     </h3>
//                     <p className="text-sm text-foreground/70 uppercase tracking-wider">
//                       {stat.label}
//                     </p>
//                   </motion.div>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {sectionDivider("bottom")}

//       {/* Services Section */}
//       <section
//         ref={servicesRef}
//         id="services"
//         className="py-20 md:py-28 px-6 sm:px-12 bg-foreground/5"
//       >
//         <div className="max-w-7xl mx-auto">
//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.2 }}
//           >
//             <motion.div
//               variants={lineVariants}
//               className="w-16 h-0.5 bg-foreground mb-8"
//             />

//             <motion.h2
//               variants={titleVariants}
//               className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 leading-tight max-w-xl"
//             >
//               {t.services.title}
//             </motion.h2>

//             <div className="grid md:grid-cols-3 gap-8 md:gap-12">
//               {t.services.offerings.map((service, index) => (
//                 <motion.div
//                   key={index}
//                   variants={fadeInUpVariants}
//                   custom={index}
//                   className="p-8 border-l-2 border-foreground/30 group hover:bg-background transition-colors duration-300"
//                 >
//                   {/* Use Lucide icons instead of custom SVGs */}
//                   <div className="mb-4">
//                     <div className="w-12 h-12 border border-foreground/30 flex items-center justify-center">
//                       {index === 0 && <Plus className="w-6 h-6" />}
//                       {index === 1 && <PlayCircle className="w-6 h-6" />}
//                       {index === 2 && <Maximize2 className="w-6 h-6" />}
//                     </div>
//                   </div>
//                   <h3 className="text-xl font-bold mb-4">{service.title}</h3>
//                   <p className="text-foreground/80">{service.description}</p>
//                   <motion.div
//                     className="mt-6 w-8 h-8 rounded-full border border-foreground flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors duration-300"
//                     whileHover={{ scale: 1.1 }}
//                     transition={{ duration: 0.2 }}
//                   >
//                     <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
//                       <path
//                         d="M3 8h10M10 3l5 5-5 5"
//                         stroke="currentColor"
//                         strokeWidth="1.5"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                   </motion.div>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Case Studies Section */}
//       <section
//         ref={caseStudiesRef}
//         id="case-studies"
//         className="py-20 md:py-28 px-6 sm:px-12"
//       >
//         <div className="max-w-7xl mx-auto">
//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.2 }}
//           >
//             <motion.div
//               variants={lineVariants}
//               className="w-16 h-0.5 bg-foreground mb-8"
//             />

//             <motion.h2
//               variants={titleVariants}
//               className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12 leading-tight"
//             >
//               {t.caseStudies.title}
//             </motion.h2>

//             <div className="grid md:grid-cols-2 gap-12">
//               {t.caseStudies.cases.map((study, index) => (
//                 <motion.div
//                   key={index}
//                   variants={fadeInUpVariants}
//                   custom={index}
//                   whileHover={{ y: -5 }}
//                   className="group"
//                 >
//                   <div className="relative h-64 sm:h-72 md:h-80 mb-6 overflow-hidden bg-foreground/10">
//                     <motion.div
//                       className="absolute inset-0 bg-gradient-to-b from-transparent to-foreground/20"
//                       whileHover={{ opacity: 0.8 }}
//                     />
//                     <div className="absolute bottom-0 left-0 p-6">
//                       <span className="inline-block px-4 py-2 bg-background text-foreground text-xs uppercase tracking-wider mb-3">
//                         {study.tag}
//                       </span>
//                     </div>
//                   </div>
//                   <h3 className="text-xl sm:text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
//                     {study.title}
//                   </h3>
//                   <p className="text-foreground/80 mb-6">{study.description}</p>
//                   <motion.a
//                     href="#"
//                     className="inline-flex items-center text-sm uppercase tracking-wider"
//                     whileHover={{ x: 5 }}
//                     transition={{ duration: 0.2 }}
//                   >
//                     {study.action}
//                     <svg
//                       className="ml-2 w-4 h-4"
//                       viewBox="0 0 16 16"
//                       fill="none"
//                     >
//                       <path
//                         d="M1 8h14M8 1l7 7-7 7"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                   </motion.a>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 md:py-28 px-6 sm:px-12 bg-foreground text-background">
//         <div className="max-w-7xl mx-auto">
//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true, amount: 0.2 }}
//             className="flex flex-col md:flex-row md:items-center justify-between gap-8"
//           >
//             <div className="md:w-2/3">
//               <motion.h2
//                 variants={titleVariants}
//                 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight"
//               >
//                 {t.cta.title}
//               </motion.h2>
//               <motion.p
//                 variants={fadeInUpVariants}
//                 custom={1}
//                 className="text-background/80 text-lg max-w-xl"
//               >
//                 {t.cta.description}
//               </motion.p>
//             </div>
//             <motion.div
//               variants={fadeInUpVariants}
//               custom={2}
//               className="md:w-1/3 flex flex-col items-start md:items-end space-y-4"
//             >
//               <motion.a
//                 href="#contact"
//                 className="px-8 py-4 bg-background text-foreground text-sm uppercase tracking-wider inline-flex items-center justify-center hover:bg-background/90 w-full md:w-auto"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 transition={{ duration: 0.2 }}
//               >
//                 {t.cta.button}
//               </motion.a>

//               <motion.a
//                 href="/sign-in"
//                 className="group px-4 py-2 text-sm text-background inline-flex items-center border border-background/30 hover:border-background transition-colors duration-300 w-full md:w-auto justify-center md:justify-center"
//                 whileHover={{ y: -2 }}
//                 transition={{ duration: 0.2 }}
//               >
//                 <span className="mr-2 text-background/80 group-hover:text-background transition-colors duration-200">
//                   {t.cta.alreadyHaveAccess}
//                 </span>
//                 <motion.span
//                   initial={{ x: 0 }}
//                   whileHover={{ x: 3 }}
//                   transition={{ duration: 0.2 }}
//                   className="font-light"
//                 >
//                   →
//                 </motion.span>
//               </motion.a>
//             </motion.div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="py-16 px-6 sm:px-12 bg-background border-t border-foreground/10">
//         <div className="max-w-7xl mx-auto">
//           <div className="grid md:grid-cols-4 gap-12">
//             <div className="md:col-span-2">
//               <h3 className="text-2xl font-bold mb-6">{t.footer.brand}</h3>
//               <p className="text-foreground/70 max-w-md mb-8">
//                 {t.footer.description}
//               </p>
//               <div className="flex space-x-4">
//                 {["twitter", "linkedin", "github"].map((platform) => (
//                   <motion.a
//                     key={platform}
//                     href="#"
//                     className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center hover:border-foreground/50"
//                     whileHover={{ y: -3, borderColor: "var(--foreground)" }}
//                     transition={{ duration: 0.2 }}
//                   >
//                     <span className="sr-only">{platform}</span>
//                   </motion.a>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <h4 className="text-sm uppercase tracking-wider mb-6 font-medium">
//                 {t.footer.headings.company}
//               </h4>
//               <ul className="space-y-4">
//                 {t.footer.company.map((item) => (
//                   <li key={item}>
//                     <motion.a
//                       href="#"
//                       className="text-foreground/70 hover:text-foreground"
//                       whileHover={{ x: 3 }}
//                       transition={{ duration: 0.2 }}
//                     >
//                       {item}
//                     </motion.a>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             <div>
//               <h4 className="text-sm uppercase tracking-wider mb-6 font-medium">
//                 {t.footer.headings.legal}
//               </h4>
//               <ul className="space-y-4">
//                 {t.footer.legal.map((item) => (
//                   <li key={item}>
//                     <motion.a
//                       href="#"
//                       className="text-muted-foreground hover:text-foreground"
//                       whileHover={{ x: 3 }}
//                       transition={{ duration: 0.2 }}
//                     >
//                       {item}
//                     </motion.a>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
//             <p className="text-muted-foreground text-sm">
//               {t.footer.copyright.replace(
//                 "{year}",
//                 new Date().getFullYear().toString()
//               )}
//             </p>
//             <p className="text-muted-foreground text-sm mt-4 md:mt-0">
//               {t.footer.tagline}. {t.footer.developedBy}
//             </p>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }
