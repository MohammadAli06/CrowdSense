import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // For now, allow all requests through.
  // Add authentication checks here later if needed.
  return NextResponse.next();
}

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
