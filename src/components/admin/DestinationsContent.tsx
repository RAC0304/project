import React from 'react';

interface DestinationsContentProps {
    user: any;
}

const DestinationsContent: React.FC<DestinationsContentProps> = ({ user }) => {
    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Destinations
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Welcome back, {user?.profile.firstName} {user?.profile.lastName}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Destinations</h2>
                <p className="text-gray-600">
                    Add, edit, and manage destinations here. This section is currently under development.
                </p>
            </div>
        </>
    );
};

export default DestinationsContent;
