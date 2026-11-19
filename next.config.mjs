/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
        port: "",
        pathname: "/thumbnail",
      },
    ],
    // Couple Profile images use new Google Drive File IDs when replaced.
    // Seven days balances repeat-visit speed with predictable refresh behavior.
    minimumCacheTTL: 604800,
    formats: ["image/webp"],
  },
};

export default nextConfig;
