/**
 * Itinerary Booking Configuration
 * 
 * This file contains all the configuration constants for the itinerary booking system.
 * Modify these values to adjust pricing, validation rules, and other business logic.
 */

export const BOOKING_CONFIG = {
    // Pricing Configuration
    PRICING: {
        BASE_PRICE_PER_DAY: 150, // USD per person per day
        GUIDE_SURCHARGE_PER_DAY: 50, // USD per day when guide is selected
        CURRENCY: 'USD',
        CURRENCY_SYMBOL: '$',
    },

    // Validation Rules
    VALIDATION: {
        MIN_ADVANCE_BOOKING_DAYS: 7, // Minimum days in advance for booking
        MAX_ADVANCE_BOOKING_DAYS: 365, // Maximum days in advance for booking
        MIN_PARTICIPANTS: 1,
        MAX_PARTICIPANTS: 20,
        MIN_DURATION_DAYS: 1,
        MAX_DURATION_DAYS: 30,
    },

    // Group Size Options
    GROUP_SIZE_OPTIONS: [
        { value: '1', label: '1 person', participants: 1 },
        { value: '2', label: '2 people', participants: 2 },
        { value: '3-4', label: '3-4 people', participants: 3 },
        { value: '5-6', label: '5-6 people', participants: 5 },
        { value: '7+', label: '7+ people', participants: 7 },
    ],

    // Status Options
    REQUEST_STATUS: {
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected',
    } as const,

    // Auto-close timers (in milliseconds)
    UI: {
        SUCCESS_MODAL_AUTO_CLOSE: 3000,
        ERROR_TOAST_DURATION: 5000,
        LOADING_DEBOUNCE: 300,
    },

    // Form Configuration
    FORM: {
        MAX_NAME_LENGTH: 100,
        MAX_EMAIL_LENGTH: 255,
        MAX_PHONE_LENGTH: 20,
        MAX_SPECIAL_REQUESTS_LENGTH: 1000,
    },

    // Date Configuration
    DATE: {
        MIN_DATE: () => {
            const today = new Date();
            today.setDate(today.getDate() + BOOKING_CONFIG.VALIDATION.MIN_ADVANCE_BOOKING_DAYS);
            return today.toISOString().split('T')[0];
        },
        MAX_DATE: () => {
            const today = new Date();
            today.setDate(today.getDate() + BOOKING_CONFIG.VALIDATION.MAX_ADVANCE_BOOKING_DAYS);
            return today.toISOString().split('T')[0];
        },
    },
};

/**
 * Utility Functions for Booking Configuration
 */
export const BookingUtils = {
    /**
     * Parse group size string to number of participants
     */
    parseGroupSize: (groupSize: string): number => {
        if (groupSize.includes('-')) {
            return parseInt(groupSize.split('-')[0], 10);
        } else if (groupSize.includes('+')) {
            return parseInt(groupSize.replace('+', ''), 10);
        } else {
            return parseInt(groupSize, 10);
        }
    },

    /**
     * Extract number of days from duration string
     */
    parseDurationDays: (duration: string): number => {
        const durationMatch = duration.match(/(\d+)/);
        return durationMatch ? parseInt(durationMatch[0], 10) : 5;
    },

    /**
     * Calculate total price for an itinerary booking
     */
    calculatePrice: (duration: string, groupSize: string, hasGuide: boolean): number => {
        const days = BookingUtils.parseDurationDays(duration);
        const participants = BookingUtils.parseGroupSize(groupSize);
        const basePrice = BOOKING_CONFIG.PRICING.BASE_PRICE_PER_DAY * days * participants;
        const guideSurcharge = hasGuide ? BOOKING_CONFIG.PRICING.GUIDE_SURCHARGE_PER_DAY * days : 0;

        return basePrice + guideSurcharge;
    },

    /**
     * Format price with currency symbol
     */
    formatPrice: (price: number): string => {
        return `${BOOKING_CONFIG.PRICING.CURRENCY_SYMBOL}${price.toLocaleString()}`;
    },

    /**
     * Check if date is within valid booking range
     */
    isValidBookingDate: (date: string): boolean => {
        const bookingDate = new Date(date);
        const today = new Date();
        const minDate = new Date(today.getTime() + BOOKING_CONFIG.VALIDATION.MIN_ADVANCE_BOOKING_DAYS * 24 * 60 * 60 * 1000);
        const maxDate = new Date(today.getTime() + BOOKING_CONFIG.VALIDATION.MAX_ADVANCE_BOOKING_DAYS * 24 * 60 * 60 * 1000);

        return bookingDate >= minDate && bookingDate <= maxDate;
    },

    /**
     * Format date for display
     */
    formatDate: (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Get status display properties
     */
    getStatusProps: (status: string) => {
        switch (status) {
            case BOOKING_CONFIG.REQUEST_STATUS.PENDING:
                return {
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: 'AlertCircle',
                    label: 'Pending'
                };
            case BOOKING_CONFIG.REQUEST_STATUS.APPROVED:
                return {
                    color: 'bg-green-100 text-green-800',
                    icon: 'CheckCircle',
                    label: 'Approved'
                };
            case BOOKING_CONFIG.REQUEST_STATUS.REJECTED:
                return {
                    color: 'bg-red-100 text-red-800',
                    icon: 'XCircle',
                    label: 'Rejected'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800',
                    icon: 'Clock',
                    label: 'Unknown'
                };
        }
    },

    /**
     * Validate form data
     */
    validateBookingForm: (formData: {
        name: string;
        email: string;
        phone?: string;
        startDate: string;
        endDate: string;
        groupSize: string;
        additionalRequests?: string;
    }): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        // Name validation
        if (!formData.name.trim()) {
            errors.push('Name is required');
        } else if (formData.name.length > BOOKING_CONFIG.FORM.MAX_NAME_LENGTH) {
            errors.push(`Name must be less than ${BOOKING_CONFIG.FORM.MAX_NAME_LENGTH} characters`);
        }

        // Email validation
        if (!formData.email.trim()) {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.push('Please enter a valid email address');
        } else if (formData.email.length > BOOKING_CONFIG.FORM.MAX_EMAIL_LENGTH) {
            errors.push(`Email must be less than ${BOOKING_CONFIG.FORM.MAX_EMAIL_LENGTH} characters`);
        }

        // Phone validation (optional)
        if (formData.phone && formData.phone.length > BOOKING_CONFIG.FORM.MAX_PHONE_LENGTH) {
            errors.push(`Phone number must be less than ${BOOKING_CONFIG.FORM.MAX_PHONE_LENGTH} characters`);
        }

        // Date validation
        if (!formData.startDate) {
            errors.push('Start date is required');
        } else if (!BookingUtils.isValidBookingDate(formData.startDate)) {
            errors.push(`Start date must be at least ${BOOKING_CONFIG.VALIDATION.MIN_ADVANCE_BOOKING_DAYS} days in advance`);
        }

        if (!formData.endDate) {
            errors.push('End date is required');
        } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            errors.push('End date must be after start date');
        }

        // Group size validation
        if (!formData.groupSize) {
            errors.push('Group size is required');
        }

        // Special requests validation
        if (formData.additionalRequests && formData.additionalRequests.length > BOOKING_CONFIG.FORM.MAX_SPECIAL_REQUESTS_LENGTH) {
            errors.push(`Special requests must be less than ${BOOKING_CONFIG.FORM.MAX_SPECIAL_REQUESTS_LENGTH} characters`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

export type BookingStatus = typeof BOOKING_CONFIG.REQUEST_STATUS[keyof typeof BOOKING_CONFIG.REQUEST_STATUS];
export type GroupSizeOption = typeof BOOKING_CONFIG.GROUP_SIZE_OPTIONS[number];
