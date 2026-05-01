/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Disable Next.js client-side Router Cache for both dynamic and static
  // segments. Without this, after a mutation (delete/create/update) the
  // cached /leads page can briefly render the pre-mutation list even when
  // router.refresh() is called.
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
  },
};

export default nextConfig;
