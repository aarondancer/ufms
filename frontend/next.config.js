/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `http://${
          process.env.NODE_ENV === "production"
            ? "host.docker.internal"
            : "localhost"
        }:4000/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
