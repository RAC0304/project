import { useContext } from "react";
import { AuthContext, AuthContextType } from "./EnhancedAuthContext";

export const useEnhancedAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useEnhancedAuth must be used within an EnhancedAuthProvider"
    );
  }
  return context;
};
