import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sharp loads libvips via dlopen; Next's automatic tracing misses the
  // shared library in Vercel functions even though it exists during build.
  outputFileTracingIncludes: {
    "/*": ["./node_modules/@img/sharp-libvips-*/lib/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "le-marque.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.wgsl": {
        loaders: ["@vgpu/wgsl/loader-webpack"],
        as: "*.js",
      },
    },
  },
  webpack(config) {
    config.module ??= {};
    config.module.rules ??= [];
    config.module.rules.push({
      test: /\.wgsl$/,
      loader: "@vgpu/wgsl/loader-webpack",
    });
    return config;
  },
};

export default nextConfig;
