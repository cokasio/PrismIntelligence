/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig