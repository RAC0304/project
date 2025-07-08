import React, { useState } from 'react';
import { X, CreditCard, Building, Smartphone, CheckCircle } from 'lucide-react';
import { paymentService, PaymentData } from '../services/paymentService';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: {
        id: number;
        title: string;
        amount: number;
        participants: number;
        source?: 'bookings' | 'itinerary_bookings';
        currency?: string; // allow currency override
    };
    userDetails: {
        name: string;
        email: string;
        phone: string;
    };
    onPaymentSuccess: () => void;
    source?: 'bookings' | 'itinerary_bookings';
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    booking,
    userDetails,
    onPaymentSuccess,
    source
}) => {
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'credit_card' | 'bank_transfer' | 'e_wallet'>('credit_card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentResult, setPaymentResult] = useState<{ success: boolean; message: string } | null>(null);

    const paymentMethods = paymentService.getAvailablePaymentMethods();

    // Use USD if booking.currency is USD, else fallback to IDR
    const formatCurrency = (amount: number) => {
        const currency = booking.currency === 'USD' ? 'USD' : 'IDR';
        const locale = currency === 'USD' ? 'en-US' : 'id-ID';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        setPaymentResult(null);

        // Determine source: prefer booking.source, fallback to prop, then 'bookings'
        const paymentSource = booking.source || source || 'bookings';

        // Build paymentData for paymentService
        const paymentData: any = {
            amount: booking.amount,
            paymentMethod: selectedPaymentMethod,
            customerDetails: userDetails,
            source: paymentSource,
        };
        if (paymentSource === 'itinerary_bookings') {
            paymentData.itineraryBookingId = booking.id;
        } else {
            paymentData.bookingId = booking.id;
        }

        try {
            const result = await paymentService.processPayment(paymentData);

            if (result.success) {
                setPaymentResult({
                    success: true,
                    message: `Payment successful! Transaction ID: ${result.transactionId}`
                });

                // Call success callback after a short delay to show success message
                setTimeout(() => {
                    onPaymentSuccess();
                    onClose();
                }, 2000);
            } else {
                setPaymentResult({
                    success: false,
                    message: result.error || 'Payment failed. Please try again.'
                });
            }
        } catch (error) {
            setPaymentResult({
                success: false,
                message: 'An unexpected error occurred. Please try again.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const getPaymentMethodIcon = (methodId: string) => {
        switch (methodId) {
            case 'credit_card':
                return <CreditCard className="w-5 h-5" />;
            case 'bank_transfer':
                return <Building className="w-5 h-5" />;
            case 'e_wallet':
                return <Smartphone className="w-5 h-5" />;
            default:
                return <CreditCard className="w-5 h-5" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Complete Payment</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isProcessing}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Booking Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-gray-900 mb-2">Booking Summary</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tour:</span>
                                <span className="font-medium">{booking.title}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Participants:</span>
                                <span className="font-medium">{booking.participants}</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2 mt-2">
                                <span>Total Amount:</span>
                                <span className="text-teal-600">{formatCurrency(booking.amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="mb-6">
                        <h3 className="font-medium text-gray-900 mb-3">Select Payment Method</h3>
                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPaymentMethod === method.id
                                        ? 'border-teal-500 bg-teal-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => setSelectedPaymentMethod(method.id as any)}
                                >
                                    <div className="flex items-center">
                                        <div className={`mr-3 ${selectedPaymentMethod === method.id ? 'text-teal-600' : 'text-gray-400'}`}>
                                            {getPaymentMethodIcon(method.id)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{method.name}</div>
                                            <div className="text-sm text-gray-500">{method.description}</div>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border-2 ${selectedPaymentMethod === method.id
                                            ? 'border-teal-500 bg-teal-500'
                                            : 'border-gray-300'
                                            }`}>
                                            {selectedPaymentMethod === method.id && (
                                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Result */}
                    {paymentResult && (
                        <div className={`mb-4 p-4 rounded-lg ${paymentResult.success
                            ? 'bg-green-50 text-green-800 border border-green-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                            <div className="flex items-center">
                                {paymentResult.success ? (
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                ) : (
                                    <X className="w-5 h-5 mr-2" />
                                )}
                                <span className="text-sm">{paymentResult.message}</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            disabled={isProcessing}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing || paymentResult?.success}
                            className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Processing...
                                </div>
                            ) : (
                                `Pay ${formatCurrency(booking.amount)}`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
