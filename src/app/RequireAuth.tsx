import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/shared/lib/auth';

export default function RequireAuth() {
  const email = useAuth((s) => s.email);
  const location = useLocation();

  if (!email) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
