/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["ui-avatars.com"],
  },
  i18n: {
    locales: ["ru"],
    defaultLocale: "ru",
  },
  env: {
    APP_URL: process.env.APP_URL,
  },
};

module.exports = nextConfig;
