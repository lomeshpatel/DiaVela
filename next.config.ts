import type { NextConfig } from "next";
import path from "path";

// Canonical project root — always lowercase regardless of shell cwd casing on Windows
const PROJECT_ROOT = path.resolve(__dirname).replace(/DiaVela/i, "diavela");

const nextConfig: NextConfig = {
  // Allow @huggingface/transformers and better-sqlite3 to run server-side
  serverExternalPackages: ["@huggingface/transformers", "better-sqlite3"],

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle native node modules — let Node.js handle them
      if (!Array.isArray(config.externals)) {
        config.externals = [config.externals].filter(Boolean);
      }
      config.externals.push("better-sqlite3");
    }

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
