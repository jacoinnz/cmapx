/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static, client-side app — no server runtime. Satisfies the
  // "no backend, nothing stored or transmitted" guarantee by architecture.
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default nextConfig;
