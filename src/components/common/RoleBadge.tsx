import React from "react";
import { Shield, User, MapPin } from "lucide-react";
import { UserRole } from "../../types";
import { getRoleDisplayName } from "../../data/users";

interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = "md",
  showIcon = true,
}) => {
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case "user":
        return {
          label: getRoleDisplayName(role),
          icon: User,
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          borderColor: "border-blue-200",
        };
      case "tour_guide":
        return {
          label: getRoleDisplayName(role),
          icon: MapPin,
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          borderColor: "border-green-200",
        }; case "admin":
        return {
          label: getRoleDisplayName(role),
          icon: Shield,
          bgColor: "bg-teal-100",
          textColor: "text-teal-800",
          borderColor: "border-teal-200",
        };
      default:
        return {
          label: "Unknown",
          icon: User,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          borderColor: "border-gray-200",
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case "sm":
        return "px-2 py-1 text-xs";
      case "lg":
        return "px-4 py-2 text-sm";
      default:
        return "px-3 py-1.5 text-sm";
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;
  const sizeClasses = getSizeClasses(size);

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses}`}
    >
      {showIcon && (
        <Icon className={`${size === "sm" ? "w-3 h-3" : "w-4 h-4"} mr-1.5`} />
      )}
      {config.label}
    </span>
  );
};

export default RoleBadge;
