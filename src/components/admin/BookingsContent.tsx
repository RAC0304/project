import React from 'react';

interface BookingsContentProps {
    user: any;
}

const BookingsContent: React.FC<BookingsContentProps> = ({ user }) => {
    return (
        <>

            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Bookings</h2>
                <p className="text-gray-600">
                    View and manage all tour bookings here. This section is currently under development.
                </p>
            </div>
        </>
    );
};

export default BookingsContent;
