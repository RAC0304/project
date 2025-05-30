import React, { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtitle }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default StatCard;
