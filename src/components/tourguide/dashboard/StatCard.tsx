import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  subtext?: string;
  bgColor?: string;
  topColor?: string;
  trendColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  subtext,
  bgColor = "bg-teal-50",
  topColor = "bg-teal-500",
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Colored top border */}
      <div className={`h-1 ${topColor}`}></div>

      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>{" "}
            {trend && (
              <p className="text-sm text-green-500 mt-1 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-trending-up w-3 h-3 mr-1"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                  <polyline points="16 7 22 7 22 13"></polyline>
                </svg>
                {trend}
              </p>
            )}
            {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
          </div>

          <div className={`p-3 rounded-lg ${bgColor}`}>{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
