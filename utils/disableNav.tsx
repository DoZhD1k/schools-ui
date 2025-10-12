"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function DisabledNav() {
  const path = usePathname();
  const disableNav = ["/ru/sign-in", "/en/sign-in", "/kz/sign-in"];
  return <>{!disableNav.includes(path) && <Header />}</>;
}
