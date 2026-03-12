import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",

    images: {
        unoptimized: true,
        formats: ["image/avif", "image/webp"],
    },

    poweredByHeader: false,
};

export default nextConfig;
