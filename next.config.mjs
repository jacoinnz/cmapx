/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server runtime enabled (Phase 4): optional accounts, cloud sync and live
  // benchmarking via API routes. The app stays local-first and fully usable
  // without any backend keys — cloud features degrade gracefully.
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
