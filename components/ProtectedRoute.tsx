import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AccessDenied } from '../pages/AccessDenied';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requirePremium?: boolean;
    requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requirePremium = false, requireAdmin = false }) => {
  const { currentUser, isAdmin, isPremium } = useAuth();

  if (!currentUser) {
      return <AccessDenied message="You must be signed in to view this page." />;
  }
  
  // If it requires admin, only admin can pass.
  if (requireAdmin && !isAdmin) {
      return <AccessDenied message="You do not have permission to view this page. This area is for administrators only." />;
  }

  // If it requires premium, premium users OR admins can pass.
  if (requirePremium && !isPremium && !isAdmin) {
      return <AccessDenied message="This content is for Premium members only." showUpgrade={true} />;
  }
  
  // If we reach here, the user is authenticated and meets any special requirements.
  return <>{children}</>;
};
