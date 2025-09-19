"use client";

import { usePathname } from "next/navigation";
import { NavPanel } from "@/components/NavPanel";

export default function DisabledNav() {
  const path = usePathname();
  const disableNav = [
    "/ru/sign-in",
    "/en/sign-in",
    "/kz/sign-in",
    "/ru/",
    "/en/",
    "/kz/",
  ];
  return <>{!disableNav.includes(path) && <NavPanel />}</>;
}
