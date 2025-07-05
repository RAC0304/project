import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight, BadgeCheck } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendType?: 'increase' | 'decrease' | 'neutral' | 'achievement';
    subtext?: string;
    bgColor?: string;
    trendColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    trend,
    trendType = 'neutral',
    subtext,
    bgColor = "bg-teal-50",
    trendColor
}) => {
    const getTrendStyles = () => {
        switch (trendType) {
            case 'increase':
                return {
                    color: 'text-green-500',
                    icon: <TrendingUp className="w-3 h-3 mr-1" />
                };
            case 'decrease':
                return {
                    color: 'text-red-500',
                    icon: <TrendingDown className="w-3 h-3 mr-1" />
                };
            case 'achievement':
                return {
                    color: 'text-blue-500',
                    icon: <BadgeCheck className="w-3 h-3 mr-1" />
                };
            default:
                return {
                    color: 'text-gray-500',
                    icon: <ArrowRight className="w-3 h-3 mr-1" />
                };
        }
    };

    const { color: defaultColor, icon: trendIcon } = getTrendStyles();
    const color = trendColor || defaultColor;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-b-2 border-transparent hover:border-teal-500">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className={`text-sm ${color} mt-1 flex items-center`}>
                            {trendIcon}
                            {trend}
                        </p>
                    )}
                    {subtext && (
                        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${bgColor}`}>{icon}</div>
            </div>
        </div>
    );
};

export default StatCard;
