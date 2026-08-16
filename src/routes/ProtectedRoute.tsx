import type { ReactNode } from 'react';

import { Navigate } from 'react-router';

import { ROUTES } from '@constants/path';

import { getAccessToken } from '@shared/auth/tokenStorage';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!getAccessToken()) {
    return <Navigate replace to={ROUTES.LOGIN} />;
  }

  return children;
};

export default ProtectedRoute;
