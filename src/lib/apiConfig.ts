/**
 * Unified API Configuration & URL Resolver.
 * Reads strictly from process.env.NEXT_PUBLIC_FACE_AUTH_API_URL.
 */

export const getApiBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_FACE_AUTH_API_URL;
  if (url && url.trim() !== "") {
    return url.replace(/\/+$/, "");
  }
  return "http://localhost:8090";
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("predator_access_token", token);
    document.cookie = `access_token=${encodeURIComponent(token)}; path=/; SameSite=Lax; max-age=86400`;
  }
};

export const clearAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("predator_access_token");
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
    document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
  }
};

export const setAuthSession = setAuthToken;
export const clearAuthSession = clearAuthToken;

export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("predator_access_token");
    if (local) return local;
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
  return null;
};


export async function safeFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const targetUrl = `${baseUrl}${path}`;

  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const finalOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  const res = await fetch(targetUrl, finalOptions);

  // If receiving 401 Unauthorized on a session endpoint, clear the stored JWT
  if (res.status === 401 && !path.startsWith("/auth/face-login") && !path.startsWith("/auth/signup")) {
    clearAuthToken();
  }

  return res;
}

