interface FetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    if (typeof window !== 'undefined' && window.location?.origin) {
      this.baseUrl = window.location.origin;
    } else {
      this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const token = this.getAuthToken();
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
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
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  async refreshTokens(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
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
