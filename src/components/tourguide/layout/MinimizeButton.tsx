import React from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

interface MinimizeButtonProps {
  isMinimized: boolean;
  onToggle: () => void;
}

const MinimizeButton: React.FC<MinimizeButtonProps> = ({
  isMinimized,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg border border-gray-200 transition-all duration-200 hover:bg-gray-200"
      title={isMinimized ? "Expand Sidebar" : "Minimize Sidebar"}
    >
      {isMinimized ? (
        <ChevronsRight size={18} className="text-gray-600" />
      ) : (
        <ChevronsLeft size={18} className="text-gray-600" />
      )}
    </button>
  );
};

export default MinimizeButton;
