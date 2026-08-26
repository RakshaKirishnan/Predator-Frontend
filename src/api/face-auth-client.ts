export type AuthUser = {
  user_id: string;
  email: string;
  name?: string;
  role?: string;
};

export type ApiSuccess<T = Record<string, unknown>> = {
  success: boolean;
  status_code?: number;
  message: string;
  data?: T;
};

export interface FaceAuthClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
}

async function readError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.message === "string") return body.message;
    if (typeof body?.detail === "string") return body.detail;
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`;
}

/**
 * Client for the 4 auth endpoints.
 * Always send face images (`image_base64`) — never embeddings.
 */
import { getApiBaseUrl } from "../lib/apiConfig";

export class FaceAuthClient {
  private baseUrl: string;
  private fetchImpl: typeof fetch;
  private getHeaders?: FaceAuthClientOptions["getHeaders"];

  constructor(options: FaceAuthClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl || fetch.bind(globalThis);
    this.getHeaders = options.getHeaders;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<ApiSuccess<T>> {
    const extra = this.getHeaders ? await this.getHeaders() : {};
    const token = typeof window !== "undefined" ? localStorage.getItem("predator_access_token") : null;
    const dynamicBase = getApiBaseUrl();
    const targetUrl = `${dynamicBase}${path}`;

    const res = await this.fetchImpl(targetUrl, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
        ...(init?.headers || {}),
      },
    });
    if (!res.ok) {
      throw new Error(await readError(res));
    }
    return (await res.json()) as ApiSuccess<T>;
  }


  /** Create account + enroll face + JWT cookies */
  signup(input: { email: string; name: string; imageBase64: string }) {
    return this.request<AuthUser>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        name: input.name,
        image_base64: input.imageBase64,
      }),
    });
  }

  /** Face image → InsightFace match → JWT cookies */
  faceLogin(imageBase64: string) {
    return this.request<AuthUser & { similarity?: number; match_percentage?: number }>(
      "/auth/face-login",
      {
        method: "POST",
        body: JSON.stringify({ image_base64: imageBase64 }),
      },
    );
  }

  /** Admin SMTP invite (requires admin cookie, except empty DB bootstrap) */
  invite(input: {
    email: string;
    name: string;
    role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  }) {
    return this.request<{ email: string; name: string; role: string; expires_at: string }>(
      "/auth/invite",
      {
        method: "POST",
        body: JSON.stringify({
          email: input.email,
          name: input.name,
          role: input.role ?? "USER",
        }),
      },
    );
  }

  /** Accept invite + enroll face + JWT cookies */
  acceptInvite(input: {
    token: string;
    email: string;
    name: string;
    imageBase64: string;
  }) {
    return this.request<AuthUser>("/auth/accept-invite", {
      method: "POST",
      body: JSON.stringify({
        token: input.token,
        email: input.email,
        name: input.name,
        image_base64: input.imageBase64,
      }),
    });
  }

  health() {
    return this.request<{
      engine_ready: boolean;
      model: string;
      endpoints: string[];
    }>("/auth/health");
  }
}
