import React from 'react';
import { AnalyticsReportType, AnalyticsReportPeriod } from '../../types';

interface ReportFormModalProps {
    isOpen: boolean;
    isEditMode: boolean;
    formData: {
        title: string;
        description: string;
        type: AnalyticsReportType;
        period: AnalyticsReportPeriod;
    };
    onClose: () => void;
    onSubmit: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const ReportFormModal: React.FC<ReportFormModalProps> = ({
    isOpen,
    isEditMode,
    formData,
    onClose,
    onSubmit,
    onChange
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {isEditMode ? 'Edit Report' : 'Create New Report'}
                    </h3>
                </div>
                <div className="p-6">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}>
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Report Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={onChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={onChange}
                                rows={3}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                Report Type
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={onChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                required
                            >
                                <option value="revenue">Revenue</option>
                                <option value="users">Users</option>
                                <option value="destinations">Destinations</option>
                                <option value="guides">Tour Guides</option>
                                <option value="bookings">Bookings</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
                                Report Period
                            </label>
                            <select
                                id="period"
                                name="period"
                                value={formData.period}
                                onChange={onChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                required
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button
                        type="button"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 mr-3"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="bg-teal-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        onClick={onSubmit}
                    >
                        {isEditMode ? 'Update Report' : 'Create Report'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportFormModal;
