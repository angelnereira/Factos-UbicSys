
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.firebaseapp.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This is the new configuration to allow cross-origin requests in development
  // from the Cloud Workstations environment.
  async headers() {
    return [
      {
        source: '/_next/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Allow all origins for simplicity in dev, can be restricted if needed
          },
        ],
      },
    ];
  },
};

export default nextConfig;
