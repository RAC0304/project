import React from 'react';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    trend,
    trendColor = "text-green-500"
}) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {trend && (
                    <p className={`text-sm ${trendColor} mt-1 flex items-center`}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {trend}
                    </p>
                )}
            </div>
            <div className="p-3 bg-teal-50 rounded-lg">{icon}</div>
        </div>
    </div>
);

export default StatCard;