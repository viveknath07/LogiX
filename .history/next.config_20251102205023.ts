import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./app"),
    };
    return config;
  },
  outputFileTracingRoot: path.join(__dirname, "../"),
  watchOptions: {
    ignored: ["**/node_modules", "**/.next", "**/dist"],
  },
};

export default nextConfig;
