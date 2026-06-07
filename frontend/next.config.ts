import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/logos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  webpack: (config, context) => {
    // Docker (WSL2/Windows) ortamında hot-reload (HMR) çalışabilmesi için polling
    if (context.dev) {
      config.watchOptions = {
        poll: 1000, // 1 saniyede bir dosya değişikliklerini kontrol et
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
