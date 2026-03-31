import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

type Role = "admin" | "jugador";

type JWTPayload = {
  id: string;
  email: string;
  role: Role;
};

const COOKIE_NAME = "slp_token";

function safeNextPath(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  return next;
}

async function verifyEdgeJWT(token: string): Promise<JWTPayload | null> {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return null;
  }

  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key);

    const id = typeof payload.id === "string" ? payload.id : null;
    const email = typeof payload.email === "string" ? payload.email : null;
    const role =
      payload.role === "admin" || payload.role === "jugador" ? payload.role : null;

    if (!id || !email || !role) return null;

    return { id, email, role };
  } catch {
    return null;
  }
}

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";

  const nextValue = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  url.searchParams.set("next", nextValue);

  return NextResponse.redirect(url);
}

function redirectToRoleHome(req: NextRequest, role: Role) {
  const url = req.nextUrl.clone();
  url.pathname = role === "admin" ? "/admin" : "/jugadores";
  url.search = "";
  return NextResponse.redirect(url);
}

function redirectToNextOrRoleHome(req: NextRequest, role: Role) {
  const nextParam = safeNextPath(req.nextUrl.searchParams.get("next"));
  if (nextParam) {
    const url = req.nextUrl.clone();
    url.pathname = nextParam;
    url.search = "";
    return NextResponse.redirect(url);
  }
  return redirectToRoleHome(req, role);
}

function clearCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

function redirectToLoginClearingCookie(req: NextRequest) {
  const res = redirectToLogin(req);
  clearCookie(res);
  return res;
}

// IMPORTANTE: ahora la función se llama proxy
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(COOKIE_NAME)?.value;

  // Caso especial: /login
  if (pathname === "/login") {
    if (!token) return NextResponse.next();

    const payload = await verifyEdgeJWT(token);
    if (!payload) {
      const res = NextResponse.next();
      clearCookie(res);
      return res;
    }

    return redirectToNextOrRoleHome(req, payload.role);
  }

  // Rutas protegidas
  if (!token) {
    return redirectToLogin(req);
  }

  const payload = await verifyEdgeJWT(token);
  if (!payload) {
    return redirectToLoginClearingCookie(req);
  }

  // Protección por rol
  if (pathname.startsWith("/admin")) {
    if (payload.role !== "admin") {
      return redirectToRoleHome(req, payload.role);
    }
  }

  if (pathname.startsWith("/jugadores")) {
    if (payload.role !== "jugador") {
      return redirectToRoleHome(req, payload.role);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/jugadores/:path*"],
};
