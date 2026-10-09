const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function fetchApi<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": "paypilot_admin_secret_key_123",
      "x-session-id": typeof window !== "undefined" ? localStorage.getItem("paypilot_session_id") || "guest" : "guest",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(errorData.message || `API Error: ${res.status}`);
  }

  return res.json();
}
