"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { runtime } from "@/lib/config";
import { serverConfig } from "@/lib/config/server";

const SESSION_COOKIE_NAME = "admin_session";

/**
 * Login action for Admin Dashboard
 */
export async function login(formData: FormData) {
  const passcode = formData.get("password") as string;
  const serverPasscode = serverConfig.admin.passcode;
  const sessionSecret = serverConfig.admin.sessionSecret;

  if (!serverPasscode || !sessionSecret) {
    console.error("ADMIN_PASSCODE or ADMIN_SESSION_SECRET is not set");
    return { error: "System configuration error. Access denied." };
  }

  if (passcode === serverPasscode) {
    // Robust session identifier using the secret
    // In a real app, this would be a signed JWT.
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionSecret, {
      httpOnly: true,
      secure: runtime.isProduction,
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    redirect("/admin/dashboard");
  }

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

/**
 * Check if the current request is from a Tailscale IP range
 */
export async function isTailscaleIP(ip: string | undefined): Promise<boolean> {
  if (!ip) {
    return false;
  }
  // Tailscale IPs are in the 100.64.0.0/10 range (100.64.0.0 to 100.127.255.255)
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) {
    return false;
  }
  return parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127;
}
