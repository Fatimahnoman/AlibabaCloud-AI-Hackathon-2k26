interface FetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === 'undefined') return;
  const isSecure = window.location.protocol === 'https:';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? '; Secure' : ''}`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

class ApiClient {
  private baseUrl: string;
  private csrfToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.location?.origin) {
      this.baseUrl = window.location.origin;
    } else {
      this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }
  }

  private getAuthToken(): string | null {
    return getCookie('accessToken');
  }

  private getCSRFToken(): string {
    if (this.csrfToken) return this.csrfToken;
    const existing = getCookie('csrf-token');
    if (existing) {
      this.csrfToken = existing;
      return existing;
    }
    const token = generateCSRFToken();
    setCookie('csrf-token', token, 86400);
    this.csrfToken = token;
    return token;
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const token = this.getAuthToken();
    const csrfToken = this.getCSRFToken();
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });
    } catch (fetchErr) {
      throw new Error(`Network error – is the server running? (${fetchErr instanceof Error ? fetchErr.message : 'fetch failed'})`);
    }

    const text = await response.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Unexpected response from server (${response.status})`);
    }

    if (!response.ok) {
      throw new Error((data.message as string) || 'Request failed');
    }

    return data as T;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', body });
  }

  setTokens(accessToken: string, refreshToken: string) {
    const accessTokenMaxAge = 15 * 60; // 15 minutes
    const refreshTokenMaxAge = 7 * 24 * 60 * 60; // 7 days
    setCookie('accessToken', accessToken, accessTokenMaxAge);
    setCookie('refreshToken', refreshToken, refreshTokenMaxAge);
  }

  clearTokens() {
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    this.csrfToken = null;
    deleteCookie('csrf-token');
  }

  async refreshTokens(): Promise<boolean> {
    const refreshToken = getCookie('refreshToken');
    if (!refreshToken) return false;

    try {
      const data = await this.post<{ data: { tokens: { accessToken: string; refreshToken: string } } }>('/api/auth/refresh', { refreshToken });
      this.setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }
}

export const apiClient = new ApiClient();
