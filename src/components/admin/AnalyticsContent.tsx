import React from 'react';

interface AnalyticsContentProps {
    user: any;
}

const AnalyticsContent: React.FC<AnalyticsContentProps> = ({ user }) => {
    return (
        <>
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics</h2>
                <p className="text-gray-600">
                    View detailed analytics and reports here. This section is currently under development.
                </p>
            </div>
        </>
    );
};

export default AnalyticsContent;
