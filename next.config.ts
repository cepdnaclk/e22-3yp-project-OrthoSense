import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "10.4.2.2",
    "localhost",
    "127.0.0.1",
  ],
};

export default nextConfig;
