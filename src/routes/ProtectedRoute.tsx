import type { ReactNode } from 'react';

import { Navigate, useLocation } from 'react-router';

import { getAccessToken } from '@apis/auth/accessToken';

import { ROUTES } from '@constants/path';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();

  if (!getAccessToken()) {
    return <Navigate replace to={ROUTES.LOGIN} state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
