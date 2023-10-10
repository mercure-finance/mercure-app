/** @type {import('next').NextConfig} */
const nextConfig = {
     skipTypescriptChecking: true,
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'raw.githubusercontent.com',
            port: '',
            pathname: '**',
          },
          {
            protocol: 'https',
            hostname: 'upload.wikimedia.org',
            port: '',
            pathname: '**',
          },
          
        ],
      },
}

module.exports = nextConfig
