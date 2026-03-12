import type { NextConfig } from "next";

const basePath = "/module-school-ranking";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
    output: "standalone",

    ...(isProd
        ? {
            basePath, // оставляем
            // ❌ УБИРАЕМ assetPrefix — он ломает маршрутизацию в iframe
        }
        : {}),

    images: {
        unoptimized: isProd,
        formats: ["image/avif", "image/webp"],
    },

    poweredByHeader: false,
};

export default nextConfig;
