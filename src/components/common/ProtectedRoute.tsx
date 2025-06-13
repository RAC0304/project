import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useEnhancedAuth } from "../../contexts/EnhancedAuthContextFix";
import { UserRole } from "../../types";

interface ProtectedRouteProps {
  children: ReactNode;
  minRole?: UserRole;
  requiredRole?: UserRole;
  requiredPermission?: {
    action: string;
    resource: string;
  };
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  minRole,
  requiredRole,
  requiredPermission,
  fallbackPath = "/login",
}) => {
  const { isLoggedIn, user, isMinRole, isRole, hasPermission } =
    useEnhancedAuth();

  // Check if user is logged in
  if (!isLoggedIn || !user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check specific role requirement
  if (requiredRole && !isRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check minimum role requirement
  if (minRole && !isMinRole(minRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check permission requirement
  if (
    requiredPermission &&
    !hasPermission(requiredPermission.action, requiredPermission.resource)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
