import React, { useState, useEffect } from 'react';
import { Destination, Attraction, Activity } from '../../types';
import type { DestinationCategory } from '../../types';
import { destinations } from '../../data/destinations';

interface DestinationsContentProps {
    user: any;
}

const DestinationsContent: React.FC<DestinationsContentProps> = ({ user }) => {
    const [allDestinations, setAllDestinations] = useState<Destination[]>(destinations);
    const [currentDestination, setCurrentDestination] = useState<Destination | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form states
    const [formData, setFormData] = useState<Partial<Destination>>({
        id: '',
        name: '',
        location: '',
        description: '',
        shortDescription: '',
        imageUrl: '',
        images: [],
        attractions: [],
        activities: [],
        bestTimeToVisit: '',
        travelTips: [],
        category: []
    });

    // Temporary states for dynamic fields
    const [newImage, setNewImage] = useState('');
    const [newTravelTip, setNewTravelTip] = useState('');
    const [newAttraction, setNewAttraction] = useState<Partial<Attraction>>({ id: '', name: '', description: '', imageUrl: '' });
    const [newActivity, setNewActivity] = useState<Partial<Activity>>({ id: '', name: '', description: '', duration: '', price: '', imageUrl: '' });
    const [selectedCategories, setSelectedCategories] = useState<DestinationCategory[]>([]);

    useEffect(() => {
        if (currentDestination) {
            setFormData(currentDestination);
            setSelectedCategories(currentDestination.category || []);
        }
    }, [currentDestination]);

    const filteredDestinations = allDestinations.filter(destination =>
        destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        destination.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddImage = () => {
        if (newImage && !formData.images?.includes(newImage)) {
            setFormData({
                ...formData,
                images: [...(formData.images || []), newImage]
            });
            setNewImage('');
        }
    };

    const handleRemoveImage = (index: number) => {
        const updatedImages = [...(formData.images || [])];
        updatedImages.splice(index, 1);
        setFormData({
            ...formData,
            images: updatedImages
        });
    };

    const handleAddTravelTip = () => {
        if (newTravelTip && !formData.travelTips?.includes(newTravelTip)) {
            setFormData({
                ...formData,
                travelTips: [...(formData.travelTips || []), newTravelTip]
            });
            setNewTravelTip('');
        }
    };

    const handleRemoveTravelTip = (index: number) => {
        const updatedTips = [...(formData.travelTips || [])];
        updatedTips.splice(index, 1);
        setFormData({
            ...formData,
            travelTips: updatedTips
        });
    };

    const handleAttractionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewAttraction({
            ...newAttraction,
            [name]: value
        });
    };

    const handleAddAttraction = () => {
        if (newAttraction.name && newAttraction.description) {
            const attractionId = `${formData.id}-attraction-${Date.now()}`;
            const attractionToAdd = {
                ...newAttraction,
                id: attractionId
            } as Attraction;

            setFormData({
                ...formData,
                attractions: [...(formData.attractions || []), attractionToAdd]
            });

            setNewAttraction({ id: '', name: '', description: '', imageUrl: '' });
        }
    };

    const handleRemoveAttraction = (index: number) => {
        const updatedAttractions = [...(formData.attractions || [])];
        updatedAttractions.splice(index, 1);
        setFormData({
            ...formData,
            attractions: updatedAttractions
        });
    };

    const handleActivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewActivity({
            ...newActivity,
            [name]: value
        });
    };

    const handleAddActivity = () => {
        if (newActivity.name && newActivity.description && newActivity.duration) {
            const activityId = `${formData.id}-activity-${Date.now()}`;
            const activityToAdd = {
                ...newActivity,
                id: activityId
            } as Activity;

            setFormData({
                ...formData,
                activities: [...(formData.activities || []), activityToAdd]
            });

            setNewActivity({ id: '', name: '', description: '', duration: '', price: '', imageUrl: '' });
        }
    };

    const handleRemoveActivity = (index: number) => {
        const updatedActivities = [...(formData.activities || [])];
        updatedActivities.splice(index, 1);
        setFormData({
            ...formData,
            activities: updatedActivities
        });
    };

    const handleCategoryToggle = (category: DestinationCategory) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }

        setFormData({
            ...formData,
            category: selectedCategories.includes(category)
                ? selectedCategories.filter(c => c !== category)
                : [...selectedCategories, category]
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        if (!formData.id || !formData.name || !formData.location || !formData.description) {
            alert('Please fill all required fields');
            return;
        }

        if (isEditing) {
            // Update existing destination
            const updatedDestinations = allDestinations.map(dest =>
                dest.id === formData.id ? { ...formData as Destination } : dest
            );
            setAllDestinations(updatedDestinations);
            alert('Destination updated successfully!');
        } else {
            // Check for ID duplication
            if (allDestinations.some(dest => dest.id === formData.id)) {
                alert('A destination with this ID already exists. Please choose a different ID.');
                return;
            }

            // Add new destination
            setAllDestinations([...allDestinations, formData as Destination]);
            alert('New destination added successfully!');
        }

        // Reset form and states
        resetForm();
    };

    const handleEdit = (destination: Destination) => {
        setCurrentDestination(destination);
        setFormData(destination);
        setSelectedCategories(destination.category || []);
        setIsEditing(true);
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this destination?')) {
            setAllDestinations(allDestinations.filter(destination => destination.id !== id));
            alert('Destination deleted successfully!');
        }
    }; const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            location: '',
            description: '',
            shortDescription: '',
            imageUrl: '',
            images: [],
            attractions: [],
            activities: [],
            bestTimeToVisit: '',
            travelTips: [],
            category: []
        });
        setSelectedCategories([]);
        setCurrentDestination(null);
        setIsEditing(false);
        setShowForm(false);
        setNewImage('');
        setNewTravelTip('');
        setNewAttraction({ id: '', name: '', description: '', imageUrl: '' });
        setNewActivity({ id: '', name: '', description: '', duration: '', price: '', imageUrl: '' });
    };

    // Define available categories as array since DestinationCategory is a type, not an enum
    const categoryOptions: DestinationCategory[] = [
        "beach",
        "mountain",
        "cultural",
        "adventure",
        "historical",
        "nature",
        "city"
    ];

    return (
        <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Destinations Management</h2>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(!showForm);
                        }}
                        className={`px-4 py-2 rounded-md ${showForm ? "bg-gray-500 hover:bg-gray-600" : "bg-teal-500 hover:bg-teal-600"
                            } text-white font-medium transition-colors`}
                    >
                        {showForm ? "Cancel" : "Add New Destination"}
                    </button>
                </div>

                {/* Search bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search destinations by name or location..."
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Form Section */}
                {showForm && (
                    <div className="bg-gray-50 p-6 rounded-md mb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {isEditing ? "Edit Destination" : "Add New Destination"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ID* <span className="text-xs text-gray-500">(used in URLs, no spaces)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="id"
                                        required
                                        disabled={isEditing}
                                        value={formData.id}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="e.g., bali-indonesia"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name*
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="e.g., Bali"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location*
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        required
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="e.g., Bali, Indonesia"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Main Image URL
                                    </label>
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Short Description
                                    </label>
                                    <input
                                        type="text"
                                        name="shortDescription"
                                        value={formData.shortDescription}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Brief one-liner about the destination"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Description*
                                    </label>
                                    <textarea
                                        name="description"
                                        required
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Detailed description of the destination"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Best Time to Visit
                                    </label>
                                    <input
                                        type="text"
                                        name="bestTimeToVisit"
                                        value={formData.bestTimeToVisit}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="e.g., April to October"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Categories
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {categoryOptions.map((category) => (
                                            <button
                                                type="button"
                                                key={category}
                                                onClick={() => handleCategoryToggle(category)}
                                                className={`px-3 py-1 text-sm rounded-full ${selectedCategories.includes(category)
                                                    ? "bg-teal-500 text-white"
                                                    : "bg-gray-200 text-gray-700"
                                                    }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Images */}
                            <div className="border-t pt-4">
                                <h4 className="text-md font-medium text-gray-800 mb-3">Additional Images</h4>
                                <div className="flex items-end gap-2 mb-4">
                                    <div className="flex-grow">
                                        <input
                                            type="url"
                                            value={newImage}
                                            onChange={(e) => setNewImage(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="Image URL"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddImage}
                                        className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                                    >
                                        Add
                                    </button>
                                </div>

                                {formData.images && formData.images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                                        {formData.images.map((img, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={img}
                                                    alt={`Additional ${index}`}
                                                    className="h-24 w-full object-cover rounded-md"
                                                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150?text=Image+Error")}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Travel Tips */}
                            <div className="border-t pt-4">
                                <h4 className="text-md font-medium text-gray-800 mb-3">Travel Tips</h4>
                                <div className="flex items-end gap-2 mb-4">
                                    <div className="flex-grow">
                                        <input
                                            type="text"
                                            value={newTravelTip}
                                            onChange={(e) => setNewTravelTip(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            placeholder="Add a travel tip"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddTravelTip}
                                        className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                                    >
                                        Add
                                    </button>
                                </div>

                                {formData.travelTips && formData.travelTips.length > 0 && (
                                    <ul className="list-disc pl-5 space-y-1">
                                        {formData.travelTips.map((tip, index) => (
                                            <li key={index} className="flex justify-between items-center">
                                                <span>{tip}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTravelTip(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Attractions */}
                            <div className="border-t pt-4">
                                <h4 className="text-md font-medium text-gray-800 mb-3">Attractions</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <input
                                        type="text"
                                        name="name"
                                        value={newAttraction.name}
                                        onChange={handleAttractionChange}
                                        className="p-2 border border-gray-300 rounded-md"
                                        placeholder="Attraction Name"
                                    />
                                    <input
                                        type="text"
                                        name="description"
                                        value={newAttraction.description}
                                        onChange={handleAttractionChange}
                                        className="p-2 border border-gray-300 rounded-md"
                                        placeholder="Attraction Description"
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="url"
                                            name="imageUrl"
                                            value={newAttraction.imageUrl}
                                            onChange={handleAttractionChange}
                                            className="flex-grow p-2 border border-gray-300 rounded-md"
                                            placeholder="Image URL"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddAttraction}
                                            className="px-3 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {formData.attractions && formData.attractions.length > 0 && (
                                    <div className="space-y-3 mt-3">
                                        {formData.attractions.map((attraction, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                                <div className="flex gap-3 items-center">
                                                    {attraction.imageUrl && (
                                                        <img
                                                            src={attraction.imageUrl}
                                                            alt={attraction.name}
                                                            className="h-10 w-10 object-cover rounded-md"
                                                            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/50?text=Image+Error")}
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-medium">{attraction.name}</div>
                                                        <div className="text-sm text-gray-600">{attraction.description}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAttraction(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Activities */}
                            <div className="border-t pt-4">
                                <h4 className="text-md font-medium text-gray-800 mb-3">Activities</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                    <input
                                        type="text"
                                        name="name"
                                        value={newActivity.name}
                                        onChange={handleActivityChange}
                                        className="p-2 border border-gray-300 rounded-md"
                                        placeholder="Activity Name"
                                    />
                                    <input
                                        type="text"
                                        name="description"
                                        value={newActivity.description}
                                        onChange={handleActivityChange}
                                        className="p-2 border border-gray-300 rounded-md"
                                        placeholder="Activity Description"
                                    />
                                    <input
                                        type="text"
                                        name="duration"
                                        value={newActivity.duration}
                                        onChange={handleActivityChange}
                                        className="p-2 border border-gray-300 rounded-md"
                                        placeholder="Duration (e.g., 2 hours)"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <input
                                        type="text"
                                        name="price"
                                        value={newActivity.price}
                                        onChange={handleActivityChange}
                                        className="p-2 border border-gray-300 rounded-md"
                                        placeholder="Price (e.g., $50 per person)"
                                    />
                                    <div className="flex items-center gap-2 md:col-span-2">
                                        <input
                                            type="url"
                                            name="imageUrl"
                                            value={newActivity.imageUrl}
                                            onChange={handleActivityChange}
                                            className="flex-grow p-2 border border-gray-300 rounded-md"
                                            placeholder="Image URL"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddActivity}
                                            className="px-3 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>

                                {formData.activities && formData.activities.length > 0 && (
                                    <div className="space-y-3 mt-3">
                                        {formData.activities.map((activity, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                                                <div className="flex gap-3 items-center">
                                                    {activity.imageUrl && (
                                                        <img
                                                            src={activity.imageUrl}
                                                            alt={activity.name}
                                                            className="h-10 w-10 object-cover rounded-md"
                                                            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/50?text=Image+Error")}
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-medium">{activity.name}</div>
                                                        <div className="text-sm text-gray-600">{activity.description}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {activity.duration} • {activity.price}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveActivity(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="border-t pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                                >
                                    {isEditing ? "Update Destination" : "Add Destination"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Destinations List */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">All Destinations ({filteredDestinations.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Destination
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Categories
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Attractions
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Activities
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDestinations.length > 0 ? (
                                    filteredDestinations.map((destination) => (
                                        <tr key={destination.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <img
                                                            className="h-10 w-10 rounded-md object-cover"
                                                            src={destination.imageUrl}
                                                            alt={destination.name}
                                                            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/40?text=Image+Error")}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{destination.name}</div>
                                                        <div className="text-sm text-gray-500">ID: {destination.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {destination.location}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {destination.category && destination.category.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {destination.category.map((cat, idx) => (
                                                            <span key={idx} className="px-2 py-1 text-xs rounded-full bg-teal-100 text-blue-800">
                                                                {cat}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">None</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {destination.attractions?.length || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {destination.activities?.length || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(destination)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(destination.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                            {searchTerm ? "No destinations match your search criteria." : "No destinations available."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DestinationsContent;
