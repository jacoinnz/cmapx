import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server runtime enabled (Phase 4): optional accounts, cloud sync and live
  // benchmarking via API routes. The app stays local-first and fully usable
  // without any backend keys — cloud features degrade gracefully.
  reactStrictMode: true,
  images: { unoptimized: true },
  // Pin Turbopack's root to this project (silences the multi-lockfile warning).
  turbopack: { root: __dirname },
};

export default nextConfig;
