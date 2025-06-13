import { useEnhancedAuth } from "./contexts/EnhancedAuthContextFix";

// This is just a test to ensure the imports work
console.log(
  "Checking if useEnhancedAuth is available:",
  typeof useEnhancedAuth === "function"
);
