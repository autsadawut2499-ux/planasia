import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native Node addons must not be Webpack-bundled (skia .node parse failure).
  serverExternalPackages: [
    "sharp",
    "@google-cloud/translate",
    "@google-cloud/vision",
    "unpdf",
  ],
  // Vendor blueprint PDFs can exceed the default 10MB middleware buffer.
  // Keep in sync with SITE_ASSETS_DOC_MAX_BYTES (100MB) + multipart overhead.
  experimental: {
    middlewareClientMaxBodySize: "110mb",
  },
  images: {
    // Serve modern formats automatically for better LCP / smaller payloads.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [64, 96, 128, 256, 384],
    // Short TTL so replaced listing/vendor images via next/image update quickly.
    // Prefer small responsive widths for cards; Next serves AVIF/WebP automatically.
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Supabase Storage (uploaded plan previews / vendor covers / avatars).
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        // Cloudflare R2 bucket for AP House scraped images.
        protocol: "https",
        hostname: "pub-98f76254806e480ea4be2ece6e5de7b3.r2.dev",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/shop", destination: "/store", permanent: true },
      // Detail: /store/[slug] already resolves id|planCode|slug — keep path segment.
      { source: "/shop/:id", destination: "/store/:id", permanent: true },
      // Public architects directory removed — send crawlers/users to the marketplace.
      { source: "/draftsmen", destination: "/store", permanent: true },
      { source: "/draftsmen/:path*", destination: "/store", permanent: true },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const sharpExternal = { sharp: "commonjs sharp" };
      const prev = config.externals;
      if (Array.isArray(prev)) {
        config.externals = [...prev, sharpExternal];
      } else if (prev) {
        config.externals = [prev, sharpExternal];
      } else {
        config.externals = [sharpExternal];
      }
    }

    return config;
  },
};

export default nextConfig;
