/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v2/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v2/:path*`,
      },
    ];
  },
}

export default nextConfig
