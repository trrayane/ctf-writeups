import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { API_BASE_URL, type ApiError } from '../lib/api';
import type { AuthTokens, AuthUser } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isBootstrapping: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    email: string;
    fullName: string;
    password: string;
    phoneNumber?: string;
    title?: string;
    avatarUrl?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  authFetch: <T>(path: string, init?: RequestInit) => Promise<T>;
  setUser: (user: AuthUser | null) => void;
}

const AUTH_STORAGE_KEY = 'novacrest.auth.tokens';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function parseJson(response: Response) {
  return (await response.json().catch(() => ({}))) as Record<string, unknown>;
}

function getStoredTokens(): AuthTokens | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AuthTokens>;
    if (!parsed.accessToken || !parsed.refreshToken) return null;
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
    };
  } catch {
    return null;
  }
}

function storeTokens(tokens: AuthTokens | null) {
  if (!tokens) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(() => getStoredTokens());
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const refreshingRef = useRef<Promise<AuthTokens | null> | null>(null);

  const clearAuth = useCallback(() => {
    setUser(null);
    setTokens(null);
    storeTokens(null);
  }, []);

  const applyTokens = useCallback((nextTokens: AuthTokens | null) => {
    setTokens(nextTokens);
    storeTokens(nextTokens);
  }, []);

  const refresh = useCallback(async (): Promise<AuthTokens | null> => {
    if (!tokens?.refreshToken) {
      clearAuth();
      return null;
    }

    if (refreshingRef.current) {
      return refreshingRef.current;
    }

    refreshingRef.current = (async () => {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      const data = (await parseJson(response)) as {
        tokens?: AuthTokens;
        user?: AuthUser;
      };

      if (!response.ok || !data.tokens || !data.user) {
        clearAuth();
        return null;
      }

      applyTokens(data.tokens);
      setUser(data.user);
      return data.tokens;
    })().finally(() => {
      refreshingRef.current = null;
    });

    return refreshingRef.current;
  }, [applyTokens, clearAuth, tokens?.refreshToken]);

  const authFetch = useCallback(
    async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
      const execute = async (accessToken: string | null) => {
        const response = await fetch(`${API_BASE_URL}${path}`, {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...(init.headers || {}),
          },
        });

        return response;
      };

      const initialResponse = await execute(tokens?.accessToken ?? null);

      if (initialResponse.status === 401 && tokens?.refreshToken) {
        const nextTokens = await refresh();

        if (nextTokens?.accessToken) {
          const retriedResponse = await execute(nextTokens.accessToken);
          const retriedData = await parseJson(retriedResponse);

          if (!retriedResponse.ok) {
            throw {
              status: retriedResponse.status,
              message:
                (retriedData.error as { message?: string } | undefined)?.message ||
                'Authenticated request failed',
            } satisfies ApiError;
          }

          return retriedData as T;
        }
      }

      const data = await parseJson(initialResponse);

      if (!initialResponse.ok) {
        throw {
          status: initialResponse.status,
          message:
            (data.error as { message?: string } | undefined)?.message ||
            'Authenticated request failed',
        } satisfies ApiError;
      }

      return data as T;
    },
    [refresh, tokens?.accessToken, tokens?.refreshToken],
  );

  const login = useCallback(
    async (payload: { email: string; password: string }) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await parseJson(response)) as {
        user?: AuthUser;
        tokens?: AuthTokens;
        error?: { message?: string };
      };

      if (!response.ok || !data.user || !data.tokens) {
        throw new Error(data.error?.message || 'Login failed');
      }

      setUser(data.user);
      applyTokens(data.tokens);
    },
    [applyTokens],
  );

  const register = useCallback(
    async (payload: {
      email: string;
      fullName: string;
      password: string;
      phoneNumber?: string;
      title?: string;
      avatarUrl?: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await parseJson(response)) as { error?: { message?: string } };

      if (!response.ok) {
        throw new Error(data.error?.message || 'Registration failed');
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    const refreshToken = tokens?.refreshToken;

    if (refreshToken) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => undefined);
    }

    clearAuth();
  }, [clearAuth, tokens?.refreshToken]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const currentTokens = getStoredTokens();

      if (!currentTokens) {
        setIsBootstrapping(false);
        return;
      }

      setTokens(currentTokens);

      try {
        const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${currentTokens.accessToken}`,
          },
        });

        if (meResponse.ok) {
          const data = (await parseJson(meResponse)) as { user: AuthUser };
          if (!cancelled) {
            setUser(data.user);
            setIsBootstrapping(false);
          }
          return;
        }

        const refreshed = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: currentTokens.refreshToken }),
        });

        if (!refreshed.ok) {
          if (!cancelled) {
            clearAuth();
            setIsBootstrapping(false);
          }
          return;
        }

        const refreshedData = (await parseJson(refreshed)) as {
          user?: AuthUser;
          tokens?: AuthTokens;
        };

        if (!cancelled && refreshedData.user && refreshedData.tokens) {
          setUser(refreshedData.user);
          applyTokens(refreshedData.tokens);
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    };

    bootstrap().catch(() => {
      if (!cancelled) {
        clearAuth();
        setIsBootstrapping(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [applyTokens, clearAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      isBootstrapping,
      login,
      register,
      logout,
      authFetch,
      setUser,
    }),
    [
      user,
      tokens,
      isBootstrapping,
      login,
      register,
      logout,
      authFetch,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
