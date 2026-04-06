import type { NextConfig } from "next";
import path from "path";

// Canonical project root — always lowercase regardless of shell cwd casing on Windows
const PROJECT_ROOT = path.resolve(__dirname).replace(/DiaVela/i, "diavela");

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Force all packages to resolve from the single canonical node_modules.
    // Without this, Windows treats "DiaVela" and "diavela" as different roots,
    // causing webpack to bundle packages like clsx twice.
    config.resolve.alias = {
      ...config.resolve.alias,
      clsx: path.join(PROJECT_ROOT, "node_modules", "clsx"),
    };

    return config;
  },
};

export default nextConfig;
