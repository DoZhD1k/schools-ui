"use client";

import { useState, useEffect } from "react";

// Standard breakpoints (matching Tailwind defaults)
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// Device types
export type DeviceType = "mobile" | "tablet" | "desktop" | "largeScreen";

// Hook to use media queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);

    // Update the state initially
    setMatches(media.matches);

    // Define listener function
    const listener = (): void => setMatches(media.matches);

    // Add the listener
    media.addEventListener("change", listener);

    // Clean up
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Hooks for common device types
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${breakpoints.sm - 1}px)`);
}

export function useIsTablet(): boolean {
  return useMediaQuery(
    `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.lg - 1}px)`
  );
}

export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.lg}px)`);
}

// Hook to get current device type
export function useDeviceType(): DeviceType {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.sm - 1}px)`);
  const isTablet = useMediaQuery(
    `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.lg - 1}px)`
  );
  const isLargeScreen = useMediaQuery(`(min-width: ${breakpoints.xl}px)`);

  if (isMobile) return "mobile";
  if (isTablet) return "tablet";
  if (isLargeScreen) return "largeScreen";
  return "desktop";
}

// Hook to detect fold/dual screen devices
export function useIsFoldableDisplay(): boolean {
  const [isFoldable, setIsFoldable] = useState<boolean>(false);

  useEffect(() => {
    // Check if window and navigator are defined (client-side)
    if (typeof window === "undefined" || !window.navigator) return;

    // Check for foldable display feature
    const checkFoldable = async (): Promise<void> => {
      if ("windowSegments" in window.navigator) {
        setIsFoldable(true);
      }
      // Samsung specific
      else if ("getWindowSegments" in window.navigator) {
        try {
          // @ts-expect-error - Proprietary API
          const segments = await window.navigator.getWindowSegments();
          setIsFoldable(segments.length > 1);
        } catch (e) {
          setIsFoldable(false);
        }
      }
    };

    checkFoldable();
  }, []);

  return isFoldable;
}

// Utility for conditional classes
export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Responsive spacing utility - returns different values based on screen size
export function responsiveValue<T>(
  defaultValue: T,
  {
    sm,
    md,
    lg,
    xl,
  }: {
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
  }
): T {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.sm - 1}px)`);
  const isTablet = useMediaQuery(
    `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md - 1}px)`
  );
  const isLaptop = useMediaQuery(
    `(min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`
  );
  const isDesktop = useMediaQuery(
    `(min-width: ${breakpoints.lg}px) and (max-width: ${breakpoints.xl - 1}px)`
  );

  if (isMobile) return sm ?? defaultValue;
  if (isTablet) return md ?? sm ?? defaultValue;
  if (isLaptop) return lg ?? md ?? sm ?? defaultValue;
  if (isDesktop) return xl ?? lg ?? md ?? sm ?? defaultValue;
  return xl ?? lg ?? md ?? sm ?? defaultValue;
}
