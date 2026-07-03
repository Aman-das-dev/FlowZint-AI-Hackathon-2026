import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect /dashboard and allow static assets/public routes to bypass
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
