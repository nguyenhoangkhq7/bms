import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  async rewrites() {
    const identityBaseUrl =
      process.env.IDENTITY_API_BASE_URL || "http://identity-service:8080";
    const productBaseUrl =
      process.env.PRODUCT_API_BASE_URL || "http://product-service:8082";
    const orderBaseUrl =
      process.env.ORDER_API_BASE_URL || "http://order-service:8083";
    const promotionBaseUrl =
      process.env.PROMOTION_API_BASE_URL || "http://promotion-service:8084";

    return [
      {
        source: "/api/v1/identity/:path*",
        destination: `${identityBaseUrl}/:path*`,
      },
      {
        source: "/api/v1/products/:path*",
        destination: `${productBaseUrl}/:path*`,
      },
      {
        source: "/api/v1/orders/:path*",
        destination: `${orderBaseUrl}/:path*`,
      },
      {
        source: "/api/v1/promotions/:path*",
        destination: `${promotionBaseUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
