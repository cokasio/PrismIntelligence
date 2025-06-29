/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['nodemailer'],
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
