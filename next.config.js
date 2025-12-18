/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['is1-ssl.mzstatic.com'],
  },
  poweredByHeader: false,
  generateEtags: false,
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig