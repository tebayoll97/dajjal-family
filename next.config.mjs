/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const privateNoStore = [
      { key: "Cache-Control", value: "private, no-store, max-age=0, must-revalidate" },
      { key: "Pragma", value: "no-cache" },
    ];

    return [
      {
        source: "/api/admin/:path*",
        headers: privateNoStore,
      },
      {
        source: "/api/storage/google/:path*",
        headers: privateNoStore,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
        port: "",
        pathname: "/thumbnail",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/df-blog-media/**",
      },
    ],
    // Couple Profile images use new Google Drive File IDs when replaced.
    // Seven days balances repeat-visit speed with predictable refresh behavior.
    minimumCacheTTL: 604800,
    formats: ["image/webp"],
  },
};

export default nextConfig;
