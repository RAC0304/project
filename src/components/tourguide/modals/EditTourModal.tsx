import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { TourData } from "../../../types/tourguide";

interface EditTourModalProps {
    isOpen: boolean;
    tourData: TourData | null;
    onClose: () => void;
    onSave: (tourData: TourData) => void;
}

const EditTourModal: React.FC<EditTourModalProps> = ({
    isOpen,
    tourData: initialTourData,
    onClose,
    onSave
}) => {
    const [tourData, setTourData] = useState<TourData>({
        id: 0,
        title: '',
        description: '',
        location: '',
        duration: '',
        price: '',
        date: '',
        time: '',
        capacity: '',
        status: 'pending',
        clients: 0
    });

    useEffect(() => {
        if (initialTourData) {
            setTourData(initialTourData);
        } else {
            // Reset form for new tour
            setTourData({
                id: 0,
                title: '',
                description: '',
                location: '',
                duration: '',
                price: '',
                date: '',
                time: '',
                capacity: '',
                status: 'pending',
                clients: 0
            });
        }
    }, [initialTourData, isOpen]); const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setTourData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }; const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!tourData.title.trim()) {
            alert('Please enter a tour title');
            return;
        }

        if (!tourData.description.trim()) {
            alert('Please enter a tour description');
            return;
        }

        if (!tourData.location.trim()) {
            alert('Please enter a location');
            return;
        }

        if (!tourData.duration.trim()) {
            alert('Please enter the tour duration');
            return;
        }

        if (!tourData.price || parseFloat(tourData.price) <= 0) {
            alert('Please enter a valid price');
            return;
        }

        if (!tourData.capacity || parseInt(tourData.capacity) <= 0) {
            alert('Please enter a valid capacity');
            return;
        }

        if (!tourData.date) {
            alert('Please select a date');
            return;
        }

        if (!tourData.time) {
            alert('Please select a time');
            return;
        }

        // Validate date is not in the past
        const selectedDate = new Date(tourData.date + 'T' + tourData.time);
        const now = new Date();
        if (selectedDate <= now) {
            alert('Please select a future date and time');
            return;
        }

        onSave(tourData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    {initialTourData ? 'Edit Tour' : 'Create New Tour'}
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    <X />
                </button>
            </div>
                <form onSubmit={handleSubmit} className="p-6">                    <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tour Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={tourData.title}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                            placeholder="Enter tour title"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={tourData.description}
                            onChange={handleChange}
                            rows={4}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                            placeholder="Describe your tour in detail"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={tourData.location}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                placeholder="e.g., Jakarta, Indonesia"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration *
                            </label>
                            <input
                                type="text"
                                name="duration"
                                value={tourData.duration}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                placeholder="e.g., 3 hours, 2 days"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (USD) *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    name="price"
                                    value={tourData.price}
                                    onChange={handleChange}
                                    className="mt-1 block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Capacity *
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                value={tourData.capacity}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                placeholder="Maximum number of guests"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={tourData.date}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time *
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={tourData.time}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={tourData.status}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                            >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
                        >
                            {initialTourData ? 'Save Changes' : 'Create Tour'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTourModal;
