import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "farmago_session";

/**
 * Verificação otimista: só confirma a *presença* do cookie (o proxy corre em
 * runtime edge e não pode falar com a base de dados). A autorização real —
 * role e posse da farmácia — é feita em cada página e em cada Server Action
 * através de `requireAdmin()` / `requirePharmacy()` em `lib/auth.ts`.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
