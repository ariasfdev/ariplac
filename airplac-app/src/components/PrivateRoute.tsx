import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // podrías poner un spinner aquí
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
