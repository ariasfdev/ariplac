import { createContext, useContext, useEffect, useState } from 'react';
import { refresh } from '../services/auth.service';
import { api } from '../services/api';

export type AuthState = {
  isAuthenticated: boolean;
  loading: boolean;
  userRole: string | null;
  userId: string | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  loading: true,
  userRole: null,
  userId: null,
};

const AuthCtx = createContext<AuthState>(initialState);

export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  const decodeToken = (token: string): { id?: string; rolId?: string } | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  };

  const getRoleNameFromId = async (rolId: string): Promise<string | null> => {
    try {
      const { data } = await api.get('/auth/roles');
      const role = Array.isArray(data) ? data.find((r: { _id: string }) => r._id === rolId) : null;
      return role?.nombre ?? null;
    } catch (error) {
      console.error('Error fetching role name', error);
      return null;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const refreshResponse = await refresh();

        // Prefer the freshly renewed access token; fallback to any stored token.
        const token = refreshResponse?.accessToken || localStorage.getItem('access_token');
        if (refreshResponse?.accessToken) {
          localStorage.setItem('access_token', refreshResponse.accessToken);
        }
        let userRole: string | null = null;
        let userId: string | null = null;

        if (token) {
          const decoded = decodeToken(token);
          if (decoded) {
            userId = decoded.id ?? null;
            if (decoded.rolId) {
              userRole = await getRoleNameFromId(decoded.rolId);
            }
          }
        }

        setState({ isAuthenticated: true, loading: false, userRole, userId });
      } catch (error) {
        setState({ isAuthenticated: false, loading: false, userRole: null, userId: null });
      }
    };

    checkSession();
  }, []);

  return <AuthCtx.Provider value={state}>{children}</AuthCtx.Provider>;
}
