/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.weather-ai.co" },
    ],
  },
};

module.exports = nextConfig;
