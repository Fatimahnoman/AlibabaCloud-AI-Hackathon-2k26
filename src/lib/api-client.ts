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

  getAuthToken(): string | null {
    return getCookie('accessToken');
  }

  getRefreshToken(): string | null {
    return getCookie('refreshToken');
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

  private buildHeaders(csrfToken: string, existingHeaders?: Record<string, string>): Record<string, string> {
    const token = this.getAuthToken();
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      ...existingHeaders,
    };
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
    return requestHeaders;
  }

  private async doFetch(url: string, method: string, headers: Record<string, string>, body?: unknown): Promise<Response> {
    return fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;
    const csrfToken = this.getCSRFToken();
    const url = `${this.baseUrl}${endpoint}`;

    let requestHeaders = this.buildHeaders(csrfToken, headers);
    let response: Response;
    try {
      response = await this.doFetch(url, method, requestHeaders, body);
    } catch (fetchErr) {
      throw new Error(`Network error – is the server running? (${fetchErr instanceof Error ? fetchErr.message : 'fetch failed'})`);
    }

    if (response.status === 401 && this.getAuthToken()) {
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        requestHeaders = this.buildHeaders(csrfToken, headers);
        try {
          response = await this.doFetch(url, method, requestHeaders, body);
        } catch (fetchErr) {
          throw new Error(`Network error – is the server running? (${fetchErr instanceof Error ? fetchErr.message : 'fetch failed'})`);
        }
      }
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
    const accessTokenMaxAge = 15 * 60;
    const refreshTokenMaxAge = 7 * 24 * 60 * 60;
    setCookie('accessToken', accessToken, accessTokenMaxAge);
    setCookie('refreshToken', refreshToken, refreshTokenMaxAge);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens() {
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    this.csrfToken = null;
    deleteCookie('csrf-token');
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  syncTokensToLocalStorage() {
    if (typeof localStorage === 'undefined') return;
    const accessToken = getCookie('accessToken');
    const refreshToken = getCookie('refreshToken');
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
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
