import React from 'react';

interface UsersContentProps {
    user: any;
}

const UsersContent: React.FC<UsersContentProps> = ({ user }) => {
    return (
        <>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>
                <p className="text-gray-600">
                    View and manage all user accounts here. This section is currently under development.
                </p>
            </div>
        </>
    );
};

export default UsersContent;
