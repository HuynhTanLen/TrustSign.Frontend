import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Chống clickjacking trang ký: chỉ cho chính site nhúng iframe (xem PDF hợp đồng).
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Không lộ ?token= của link ký/xác minh/đặt lại mật khẩu sang site khác qua Referer.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // eKYC cần camera của chính site; vẫn chặn iframe bên thứ ba dùng camera.
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
