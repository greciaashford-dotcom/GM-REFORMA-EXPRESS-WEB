import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/es/login";

  const response = NextResponse.redirect(url);
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
