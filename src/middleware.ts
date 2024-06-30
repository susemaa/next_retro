import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuth = !!token;
  const isLoginPage = req.nextUrl.pathname === "/";
  const isRetro = req.nextUrl.pathname.startsWith("/retros/");

  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isRetro) {
    const retroId = req.nextUrl.pathname.split("/retros/")[1];
    const response = await fetch(new URL(`/api/retros/${retroId}`, req.url), { method: "GET" });

    if (response.status === 404) {
      return NextResponse.redirect(new URL("/retros", req.url));
    } else {
      return NextResponse.next();
    }
  }

  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL("/retros", req.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/", "/retros", "/retros/:retro_id*"] };
