import React from 'react';

interface SettingsContentProps {
    user: any;
}

const SettingsContent: React.FC<SettingsContentProps> = ({ user }) => {
    return (
        <>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">System Settings</h2>
                <p className="text-gray-600">
                    Configure system settings here. This section is currently under development.
                </p>
            </div>
        </>
    );
};

export default SettingsContent;
