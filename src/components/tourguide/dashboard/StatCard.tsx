import React from "react";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendType?: "increase" | "decrease" | "neutral" | "achievement";
  subtext?: string;
  bgColor?: string;
  trendColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendType = "neutral",
  subtext,
  bgColor = "bg-teal-50",
  trendColor,
  gradientFrom = "from-teal-500",
  gradientTo = "to-teal-600",
}) => {
  const getTrendStyles = () => {
    switch (trendType) {
      case "increase":
        return {
          color: "text-green-600",
          bgColor: "bg-green-50",
          icon: <TrendingUp className="w-3 h-3 mr-1" />,
        };
      case "decrease":
        return {
          color: "text-red-600",
          bgColor: "bg-red-50",
          icon: <TrendingDown className="w-3 h-3 mr-1" />,
        };
      case "achievement":
        return {
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
        };
      default:
        return {
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          icon: <ArrowRight className="w-3 h-3 mr-1" />,
        };
    }
  };

  const trendStyles = getTrendStyles();
  const color = trendColor || trendStyles.color;

  return (
    <div className="group relative overflow-hidden">
      {/* Gradient border */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl p-0.5`}
      >
        <div className="bg-white rounded-2xl h-full w-full"></div>
      </div>

      {/* Card content */}
      <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
        {/* Decorative gradient line */}
        <div
          className={`h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-full mb-4`}
        ></div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>

            {trend && (
              <div
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${trendStyles.bgColor} ${color}`}
              >
                {trendStyles.icon}
                {trend}
              </div>
            )}

            {subtext && (
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                {subtext}
              </p>
            )}
          </div>

          {/* Icon container */}
          <div
            className={`p-4 rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}
          >
            <div className="text-2xl">{icon}</div>
          </div>
        </div>

        {/* Subtle background pattern */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-gray-100 to-transparent opacity-30"></div>
      </div>
    </div>
  );
};

export default StatCard;
