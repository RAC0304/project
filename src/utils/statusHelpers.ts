/**
 * Returns the Tailwind CSS classes for a given status
 */
export const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "confirmed":
        case "active":
            return "bg-green-100 text-green-800";
        case "pending":
        case "draft":
            return "bg-yellow-100 text-yellow-800";
        case "cancelled":
            return "bg-red-100 text-red-800";
        case "new":
            return "bg-blue-100 text-blue-800";
        case "upcoming":
            return "bg-indigo-100 text-indigo-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

/**
 * Format a number as IDR currency
 */
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};
