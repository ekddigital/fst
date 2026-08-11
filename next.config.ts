import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";

// Ensure .env is loaded before reading build-time flags (next.config runs early).
loadEnvConfig(process.cwd());

const buildCpus = process.env.NEXT_BUILD_CPUS
  ? Number(process.env.NEXT_BUILD_CPUS)
  : undefined;

// cPanel/TMD: image optimizer (sharp) fails on old glibc — serve /public/images directly.
const imageUnoptimized = true;

const nextConfig: NextConfig = {
  images: {
    unoptimized: imageUnoptimized,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "faststarttalking.com",
      },
    ],
  },
  ...(buildCpus
    ? {
        experimental: {
          cpus: buildCpus,
          workerThreads: false,
        },
      }
    : {}),
};

export default nextConfig;
