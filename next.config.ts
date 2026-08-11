import type { NextConfig } from "next";

const buildCpus = process.env.NEXT_BUILD_CPUS
  ? Number(process.env.NEXT_BUILD_CPUS)
  : undefined;

// cPanel/TMD: image optimizer (sharp) fails on old glibc — serve /public/images directly.
const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
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
