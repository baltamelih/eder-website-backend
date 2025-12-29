import { apiFetch } from "./api";

/**
 * POST /api/auth/request-password-reset
 * body: { email }
 */
export async function requestPasswordReset(email) {
  return apiFetch("/api/auth/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * POST /api/auth/reset-password
 * body: { email, code, new_password }
 */
export async function resetPassword({ email, code, new_password }) {
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      email,
      code,
      new_password,
    }),
  });
}
