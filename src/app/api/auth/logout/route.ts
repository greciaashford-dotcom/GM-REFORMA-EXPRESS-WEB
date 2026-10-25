import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

function performLogout(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/es/login";
  url.search = "";

  const response = NextResponse.redirect(url, 303);
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}

export async function POST(req: NextRequest) {
  return performLogout(req);
}

export async function GET(req: NextRequest) {
  return performLogout(req);
}
