import React from 'react';
import { AnalyticsItem } from '../../types';
import { BarChart3 } from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LineChart,
    Line
} from 'recharts';

interface ChartProps {
    data: AnalyticsItem[];
    title: string;
    type?: 'area' | 'bar' | 'line';
    color?: string;
    formatValue?: (value: number) => string;
}

const AnalyticsChart: React.FC<ChartProps> = ({
    data,
    title,
    type = 'area',
    color = '#14b8a6',
    formatValue = (val) => val.toString()
}) => {
    // Process data for Recharts
    const chartData = data.map(item => {
        const date = new Date(item.date);
        const month = date.toLocaleString('default', { month: 'short' });

        return {
            name: month,
            value: item.value
        };
    });

    // Custom tooltip formatter
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
                    <p className="text-sm text-gray-600">{`${label}`}</p>
                    <p className="text-sm font-semibold text-gray-800">{formatValue(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    // If no data is provided, show empty chart
    if (!data || data.length === 0) {
        return <EmptyChart />;
    }

    const renderChart = () => {
        switch (type) {
            case 'bar':
                return (
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={formatValue} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                );
            case 'line':
                return (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={formatValue} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            strokeWidth={2}
                            dot={{ r: 4, fill: color, strokeWidth: 1 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                );
            default: // area
                return (
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`color-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={formatValue} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            fillOpacity={1}
                            fill={`url(#color-${title.replace(/\s+/g, '-')})`}
                        />
                    </AreaChart>
                );
        }
    };

    return (
        <div className="w-full h-full">
            <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-2 text-xs text-gray-500">
                <span>Last {data.length} months</span>
            </div>
        </div>
    );
};

// Placeholder component when no data is available
export const EmptyChart: React.FC<{ message?: string }> = ({ message = "No data available" }) => {
    return (
        <div className="w-full h-72 flex flex-col items-center justify-center bg-gray-50 rounded-md">
            <BarChart3 className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">{message}</p>
        </div>
    );
};

export default AnalyticsChart;
