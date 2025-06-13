// src/components/common/TimezoneInfo.tsx
import React from "react";
import { Clock } from "lucide-react";
import { getCurrentIndonesianTime } from "../../utils/dateUtils";

interface TimezoneInfoProps {
  className?: string;
  showFull?: boolean;
}

const TimezoneInfo: React.FC<TimezoneInfoProps> = ({
  className = "",
  showFull = false,
}) => {
  const currentTime = getCurrentIndonesianTime();

  if (showFull) {
    return (
      <div className={`flex items-center text-sm text-gray-600 ${className}`}>
        <Clock className="w-4 h-4 mr-2" />
        <div>
          <div>
            Waktu Indonesia:{" "}
            {currentTime.toLocaleString("id-ID", {
              timeZone: "Asia/Jakarta",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <div className="text-xs text-gray-500">Timezone: WIB (UTC+7)</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center text-xs text-gray-500 ${className}`}>
      <Clock className="w-3 h-3 mr-1" />
      <span>WIB (UTC+7)</span>
    </div>
  );
};

export default TimezoneInfo;
