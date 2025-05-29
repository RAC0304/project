import React, { useState } from 'react';
import { AnalyticsReport, AnalyticsReportType } from '../../types';
import { Download, Edit, Trash, FileText } from 'lucide-react';
import {
    getTimeSeriesData,
    getTopDestinations,
    getTopTourGuides
} from '../../data/analytics';

interface ReportTableProps {
    reports: AnalyticsReport[];
    onEdit: (report: AnalyticsReport) => void;
    onDelete: (reportId: string) => void;
}

const ReportTable: React.FC<ReportTableProps> = ({ reports, onEdit, onDelete }) => {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const reportsPerPage = 5;

    // Calculate pagination values
    const indexOfLastReport = currentPage * reportsPerPage;
    const indexOfFirstReport = indexOfLastReport - reportsPerPage;
    const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
    const totalPages = Math.ceil(reports.length / reportsPerPage);

    // Pagination navigation
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    // Function to get report type badge color
    const getReportTypeBadgeColor = (type: AnalyticsReportType) => {
        switch (type) {
            case 'revenue':
                return 'bg-green-100 text-green-800';
            case 'users':
                return 'bg-blue-100 text-blue-800';
            case 'destinations':
                return 'bg-purple-100 text-purple-800';
            case 'guides':
                return 'bg-orange-100 text-orange-800';
            case 'bookings':
                return 'bg-teal-100 text-teal-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Function to get report period badge text
    const getReportPeriodText = (period: string) => {
        switch (period) {
            case 'daily':
                return 'Daily';
            case 'weekly':
                return 'Weekly';
            case 'monthly':
                return 'Monthly';
            case 'quarterly':
                return 'Quarterly';
            case 'yearly':
                return 'Yearly';
            default:
                return 'Custom';
        }
    };    // Handle download action
    const handleDownload = (report: AnalyticsReport) => {
        // Generate CSV data based on report type
        const generateCsvData = (report: AnalyticsReport) => {
            let csvData = '';
            let headers = '';
            let values = '';

            // Get data based on report type
            switch (report.type) {
                case 'revenue':
                    headers = 'Date,Revenue\n';
                    values = getTimeSeriesData('revenue')
                        .map(item => `${item.date},${item.value}`)
                        .join('\n');
                    break;
                case 'bookings':
                    headers = 'Date,Bookings\n';
                    values = getTimeSeriesData('bookings')
                        .map(item => `${item.date},${item.value}`)
                        .join('\n');
                    break;
                case 'users':
                    headers = 'Date,Users\n';
                    values = getTimeSeriesData('users')
                        .map(item => `${item.date},${item.value}`)
                        .join('\n');
                    break;
                case 'destinations':
                    headers = 'Destination,Bookings,Revenue,Rating\n';
                    values = getTopDestinations()
                        .map(item => `${item.name},${item.bookings},${item.revenue},${item.rating}`)
                        .join('\n');
                    break;
                case 'guides':
                    headers = 'Guide,Bookings,Revenue,Rating\n';
                    values = getTopTourGuides()
                        .map(item => `${item.name},${item.bookings},${item.revenue},${item.rating}`)
                        .join('\n');
                    break;
                default:
                    headers = 'Date,Value\n';
                    values = 'No data available,0';
            }

            csvData = headers + values;
            return csvData;
        };

        // Create and download CSV file
        const csvData = generateCsvData(report);
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        // Format date for filename
        const dateStr = new Date().toISOString().split('T')[0];

        // Set file attributes and download
        link.setAttribute('href', url);
        link.setAttribute('download', `${report.title.replace(/\s+/g, '-')}_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };    // Empty state when no reports
    if (reports.length === 0) {
        return (
            <div className="overflow-x-auto">
                <div className="text-center py-8">
                    <div className="mx-auto h-12 w-12 text-gray-400 flex items-center justify-center">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        No reports match your current filters. Try adjusting your search criteria.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Report Name
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Period
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Updated
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-4 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {currentReports.map((report) => (
                        <tr key={report.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col">
                                    <div className="text-sm font-medium text-gray-900">{report.title}</div>
                                    <div className="text-xs text-gray-500 mt-1">{report.description}</div>
                                </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReportTypeBadgeColor(report.type)}`}>
                                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                                </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                {getReportPeriodText(report.period)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{report.lastUpdated}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                {report.status === 'available' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Available
                                    </span>
                                ) : report.status === 'processing' ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Processing
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Error
                                    </span>
                                )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    className="text-teal-600 hover:text-teal-900 mr-3"
                                    onClick={() => handleDownload(report)}
                                    title="Download Report"
                                >
                                    <Download className="w-4 h-4" />
                                </button>
                                <button
                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                    onClick={() => onEdit(report)}
                                    title="Edit Report"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>                                <button
                                    className="text-red-600 hover:text-red-900"
                                    onClick={() => onDelete(report.id)}
                                    title="Delete Report"
                                >
                                    <Trash className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {reports.length > reportsPerPage && (
                <div className="py-3 flex items-center justify-between border-t border-gray-200 mt-4">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{indexOfFirstReport + 1}</span> to{' '}
                                <span className="font-medium">
                                    {indexOfLastReport > reports.length ? reports.length : indexOfLastReport}
                                </span>{' '}
                                of <span className="font-medium">{reports.length}</span> reports
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="sr-only">Previous</span>
                                    {/* Previous icon */}
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* Page numbers */}
                                {[...Array(totalPages).keys()].map(number => (
                                    <button
                                        key={number + 1}
                                        onClick={() => goToPage(number + 1)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === number + 1
                                            ? 'z-10 bg-teal-50 border-teal-500 text-teal-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        {number + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="sr-only">Next</span>
                                    {/* Next icon */}
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportTable;
