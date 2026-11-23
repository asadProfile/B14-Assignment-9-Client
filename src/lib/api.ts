const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('salonbook_token');
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('salonbook_token', token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('salonbook_token');
  }
};

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; [key: string]: any }> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${res.status}`,
        ...data,
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error occurred. Please check your server connection.',
    };
  }
}
