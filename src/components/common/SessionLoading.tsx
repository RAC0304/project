import React from "react";

interface SessionLoadingProps {
  message?: string;
}

const SessionLoading: React.FC<SessionLoadingProps> = ({
  message = "Checking session...",
}) => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full border-t-teal-600 animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default SessionLoading;
