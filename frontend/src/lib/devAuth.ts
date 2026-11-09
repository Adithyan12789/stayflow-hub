/**
 * Development authentication helpers for email/password login
 */

export interface AuthResult {
  success: boolean;
  error?: string;
}

/**
 * Sign up a new user with email and password
 */
export async function devSignup(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/dev-signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Signup failed",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[DevAuth] Signup error:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

/**
 * Log in with email and password
 */
export async function devLogin(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const response = await fetch("/api/auth/dev-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Login failed",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[DevAuth] Login error:", error);
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}
