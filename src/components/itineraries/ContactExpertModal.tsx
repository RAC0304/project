import React, { useState } from "react";
import { X, MessageSquare } from "lucide-react";

interface ContactExpertModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ContactExpertModal: React.FC<ContactExpertModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        destination: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);

            // Reset form after showing success message
            setTimeout(() => {
                setIsSuccess(false);
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    destination: "",
                    message: "",
                });
                onClose();
            }, 3000);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isSuccess ? "Message Sent" : "Contact Our Travel Experts"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {isSuccess ? (
                    <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Thank you for contacting us!
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Our travel experts will get back to you within 24 hours to help plan your perfect Indonesian journey.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Phone Number (optional)
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="destination"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Preferred Destination
                                </label>
                                <select
                                    id="destination"
                                    name="destination"
                                    value={formData.destination}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                                    required
                                >
                                    <option value="">Select a destination</option>
                                    <option value="bali">Bali</option>
                                    <option value="jakarta">Jakarta</option>
                                    <option value="yogyakarta">Yogyakarta</option>
                                    <option value="lombok">Lombok</option>
                                    <option value="komodo">Komodo Islands</option>
                                    <option value="raja-ampat">Raja Ampat</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="message"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Your Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={5}
                                required
                                placeholder="Tell us about your travel interests, preferred dates, budget, or any questions you have..."
                                value={formData.message}
                                onChange={handleChange}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            ></textarea>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    "Send Message"
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ContactExpertModal;
