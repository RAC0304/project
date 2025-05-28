import React from 'react';

interface GuidesContentProps {
    user: any;
}

const GuidesContent: React.FC<GuidesContentProps> = ({ user }) => {
    return (
        <>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Tour Guide Management</h2>
                <p className="text-gray-600">
                    Approve and manage tour guide accounts here. This section is currently under development.
                </p>
            </div>
        </>
    );
};

export default GuidesContent;
