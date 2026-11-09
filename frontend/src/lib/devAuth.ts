/**
 * Development authentication helpers for email/password login
 * Used when OAuth is not configured (local development)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export type AuthResult = {
  success: boolean;
  error?: string;
};

export async function devSignup(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/dev-signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Signup failed. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[DevAuth] Signup error:", error);
    return {
      success: false,
      error: "Network error. Please check your connection.",
    };
  }
}

export async function devLogin(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/dev-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Login failed. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[DevAuth] Login error:", error);
    return {
      success: false,
      error: "Network error. Please check your connection.",
    };
  }
}
