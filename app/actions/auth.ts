"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { runtime } from "@/lib/config";
import { serverConfig } from "@/lib/config/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  secretsEqual,
} from "@/lib/auth/session-token";
import { getClientIp } from "@/lib/services/client-ip";
import {
  isLoginRateLimited,
  registerFailedLogin,
  clearLoginFailures,
} from "@/lib/services/login-protection";

/**
 * Login action for Admin Dashboard.
 *
 * Protections: per-IP failed-attempt rate limiting, constant-time passcode
 * comparison, signed expiring session token (never the raw secret).
 *
 * @see .docs/dev/ADMIN_ACCESS.md
 */
export async function login(formData: FormData) {
  const passcode = formData.get("password");
  const serverPasscode = serverConfig.admin.passcode;
  const sessionSecret = serverConfig.admin.sessionSecret;

  if (!serverPasscode || !sessionSecret) {
    console.error("ADMIN_PASSCODE or ADMIN_SESSION_SECRET is not set");
    return { error: "System configuration error. Access denied." };
  }

  const clientIp = await getClientIp();
  if (isLoginRateLimited(clientIp)) {
    return {
      error: "Too many failed attempts. Please try again later.",
    };
  }

  const passcodeMatches =
    typeof passcode === "string" &&
    (await secretsEqual(passcode, serverPasscode));

  if (passcodeMatches) {
    clearLoginFailures(clientIp);

    const cookieStore = await cookies();
    cookieStore.set(
      SESSION_COOKIE_NAME,
      await createSessionToken(sessionSecret),
      {
        httpOnly: true,
        secure: runtime.isProduction,
        sameSite: "strict",
        maxAge: SESSION_MAX_AGE_SECONDS,
        path: "/",
      }
    );

    redirect("/admin/dashboard");
  }

  registerFailedLogin(clientIp);

  // Deter brute-forcing with a synthetic delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { error: "Invalid Access Code. Subspace entry denied." };
}

/**
 * Logout action for Admin Dashboard
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin/dashboard/login");
}
