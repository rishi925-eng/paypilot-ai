const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function fetchApi<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const token = typeof window !== "undefined" ? localStorage.getItem("paypilot_auth_token") : null;
  const sessionId = typeof window !== "undefined" ? localStorage.getItem("paypilot_session_id") || "guest" : "guest";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-admin-key": "paypilot_admin_secret_key_123",
    "x-session-id": sessionId,
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `API Error: ${res.status}`);
  }

  return res.json();
}
