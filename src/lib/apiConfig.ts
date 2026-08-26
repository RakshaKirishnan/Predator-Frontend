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

export async function safeFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = getApiBaseUrl();
  const targetUrl = `${baseUrl}${path}`;

  const token = typeof window !== "undefined" ? localStorage.getItem("predator_access_token") : null;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const finalOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  return await fetch(targetUrl, finalOptions);
}
