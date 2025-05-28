import React from 'react';

interface DestinationsContentProps {
    user: any;
}

const DestinationsContent: React.FC<DestinationsContentProps> = ({ user }) => {
    return (
        <>

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
