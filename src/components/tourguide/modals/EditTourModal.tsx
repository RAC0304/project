import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Tour } from "../../../services/tourService";
import { getDestinationsForDropdown } from "../../../services/destinationService";

interface EditTourModalProps {
  isOpen: boolean;
  tourData: Tour | null;
  onClose: () => void;
  onSave: (tourData: Tour) => void;
}

const EditTourModal: React.FC<EditTourModalProps> = ({
  isOpen,
  tourData: initialTourData,
  onClose,
  onSave,
}) => {
  const [destinations, setDestinations] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [tourData, setTourData] = useState<Tour>({
    id: 0,
    tour_guide_id: 0,
    title: "",
    description: "",
    location: "",
    duration: "",
    price: 0,
    max_group_size: 1,
    is_active: true,
    destination_id: 0, // Set default value instead of undefined
  });

  useEffect(() => {
    if (initialTourData) {
      setTourData(initialTourData);
    } else {
      setTourData({
        id: 0,
        tour_guide_id: 0,
        title: "",
        description: "",
        location: "",
        duration: "",
        price: 0,
        max_group_size: 1,
        is_active: true,
        destination_id: 0, // Set default value instead of undefined
      });
    }
  }, [initialTourData, isOpen]);

  // Load destinations when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadDestinations = async () => {
        try {
          const destinationData = await getDestinationsForDropdown();
          setDestinations(destinationData);
        } catch (error) {
          console.error("Error loading destinations:", error);
        }
      };
      loadDestinations();
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      e.target instanceof HTMLInputElement && type === "checkbox"
        ? e.target.checked
        : undefined;

    setTourData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "price" ||
            name === "max_group_size" ||
            name === "destination_id"
          ? Number(value)
          : value,
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !tourData.title.trim() ||
      !tourData.description.trim() ||
      !tourData.location.trim() ||
      !tourData.duration.trim() ||
      tourData.price <= 0 ||
      tourData.max_group_size <= 0 ||
      !tourData.destination_id ||
      tourData.destination_id <= 0
    ) {
      alert(
        "Please fill all required fields with valid values, including selecting a destination."
      );
      return;
    }

    console.log("EditTourModal - tourData before save:", tourData);
    console.log("EditTourModal - tourData.id:", tourData.id);
    console.log("EditTourModal - initialTourData:", initialTourData); // For editing: send the full tour data with id
    // For creating: remove the id property completely
    let tourToSave;
    if (initialTourData && initialTourData.id && initialTourData.id > 0) {
      // This is an edit operation - initialTourData exists and has valid id
      tourToSave = { ...tourData };
      console.log("EditTourModal - Edit mode, tourToSave:", tourToSave);
    } else {
      // This is a create operation - no initialTourData or id is 0/invalid
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...tourWithoutId } = tourData;
      tourToSave = tourWithoutId;
      console.log("EditTourModal - Create mode, tourToSave:", tourToSave);
    }

    onSave(tourToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {initialTourData ? "Edit Tour" : "Create New Tour"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination *
              </label>
              <select
                name="destination_id"
                value={tourData.destination_id || 0}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                required
              >
                <option value={0}>Select a destination</option>
                {destinations.map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {destination.name}
                  </option>
                ))}
              </select>
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
                  Max Group Size *
                </label>
                <input
                  type="number"
                  name="max_group_size"
                  value={tourData.max_group_size}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  placeholder="Maximum number of guests"
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                checked={tourData.is_active}
                onChange={handleChange}
              />
              <label className="text-sm">Active</label>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
            >
              {initialTourData ? "Save Changes" : "Create Tour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTourModal;
