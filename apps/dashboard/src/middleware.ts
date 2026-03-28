export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/alerts/:path*",
    "/analytics/:path*",
    "/reports/:path*",
    "/cameras/:path*",
    "/zone-config/:path*",
  ],
};
