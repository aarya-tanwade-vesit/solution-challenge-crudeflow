import { ApiClientError, NetworkError, ServerError } from './errors';

type ApiEnvelope<T> = {
  success: boolean;
  timestamp: string;
  requestId: string;
  source: string;
  data: T;
  error?: {
    code: string;
    message: string;
  };
};

const DEFAULT_API_URL = '/api/v1';

function getApiBaseUrl() {
  const configured = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');
  return configured.length ? configured : DEFAULT_API_URL;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });

    const body = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
    const requestId = body?.requestId;

    if (!response.ok) {
      if (response.status >= 500) {
        throw new ServerError(body?.error?.message || `Server Error: ${response.status}`, response.status, requestId);
      }
      throw new ApiClientError(body?.error?.message || `API Error: ${response.status}`, response.status, requestId);
    }

    if (!body || body.success !== true) {
      throw new ApiClientError(body?.error?.message || 'API response was not successful', response.status, requestId);
    }

    return body.data;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    
    // Handle network errors (e.g. backend offline)
    console.error(`[api] Connection failed to ${url}`, error);
    throw new NetworkError(`Could not connect to backend at ${url}`);
  }
}

/**
 * Generic GET with fallback support
 */
export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    return await request<T>(path);
  } catch (error) {
    if (process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NODE_ENV === 'development') {
      console.warn(`[api] GET ${path} failed, using fallback.`, error);
    }
    return fallback;
  }
}

/**
 * Generic POST with fallback support
 */
export async function apiPost<T, TBody = unknown>(path: string, body: TBody, fallback: T): Promise<T> {
  try {
    return await request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body ?? {}),
    });
  } catch (error) {
    if (process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NODE_ENV === 'development') {
      console.warn(`[api] POST ${path} failed, using fallback.`, error);
    }
    return fallback;
  }
}

export { ApiClientError, NetworkError, ServerError };
