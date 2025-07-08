import { useState, useEffect, useCallback } from 'react';
import { Destination, DestinationCategory } from '../types';
import {
    getDestinations,
    getDestinationCategories,
    DestinationFilters
} from '../services/destinationService';

export interface UseDestinationsState {
    destinations: Destination[];
    filteredDestinations: Destination[];
    categories: { label: string; value: DestinationCategory }[];
    loading: boolean;
    error: string | null;
    searchTerm: string;
    selectedCategories: DestinationCategory[];
    total: number;
    hasMore: boolean;
}

export interface UseDestinationsActions {
    setSearchTerm: (term: string) => void;
    setSelectedCategories: (categories: DestinationCategory[]) => void;
    toggleCategory: (category: DestinationCategory) => void;
    clearFilters: () => void;
    loadMore: () => Promise<void>;
    refresh: () => Promise<void>;
}

export interface UseDestinationsReturn extends UseDestinationsState, UseDestinationsActions { }

const categoryLabels: Record<DestinationCategory, string> = {
    beach: 'Beach',
    mountain: 'Mountain',
    cultural: 'Cultural',
    adventure: 'Adventure',
    historical: 'Historical',
    nature: 'Nature',
    city: 'City'
};

export const useDestinations = (initialFilters: DestinationFilters = {}): UseDestinationsReturn => {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [categories, setCategories] = useState<{ label: string; value: DestinationCategory }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [selectedCategories, setSelectedCategories] = useState<DestinationCategory[]>(
        initialFilters.categories || []
    );
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);

    // Compute filtered destinations based on current filters
    const filteredDestinations = destinations;

    // Load categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const availableCategories = await getDestinationCategories();
                const categoriesWithLabels = availableCategories.map(cat => ({
                    label: categoryLabels[cat] || cat,
                    value: cat
                }));
                setCategories(categoriesWithLabels);
            } catch (err) {
                console.error('Failed to load categories:', err);
                // Fallback to default categories
                const defaultCategories: DestinationCategory[] = ['beach', 'mountain', 'cultural', 'adventure', 'historical', 'nature', 'city'];
                setCategories(defaultCategories.map(cat => ({
                    label: categoryLabels[cat],
                    value: cat
                })));
            }
        };

        loadCategories();
    }, []);

    // Load destinations when filters change
    const loadDestinations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);


            // Ambil semua destinasi tanpa limit

            const filters: DestinationFilters = {
                search: searchTerm || undefined,
                location: initialFilters.location || undefined,
                categories: selectedCategories.length > 0 ? selectedCategories : undefined
                // Tidak ada limit dan offset untuk menampilkan semua data
            };

            const result = await getDestinations(filters);

            // Selalu reset karena tidak ada pagination
            setDestinations(result.destinations);
            setTotal(result.total);
            setHasMore(false); // Selalu false karena semua data sudah dimuat

            // Debug information
            console.log('All destinations loaded:', {
                total: result.total,
                loaded: result.destinations.length
            });

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load destinations';
            setError(errorMessage);
            console.error('Error loading destinations:', err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedCategories, offset]);

    // Initial load and reload when filters change
    useEffect(() => {
        setOffset(0); // Reset offset when filters change
        loadDestinations();
    }, [searchTerm, selectedCategories]);

    // Actions
    const toggleCategory = useCallback((category: DestinationCategory) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    }, []);

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setSelectedCategories([]);
    }, []);

    const loadMore = useCallback(async () => {
        // Tidak digunakan lagi karena semua data sudah dimuat
        return;
    }, []);

    const refresh = useCallback(async () => {
        await loadDestinations();
    }, [loadDestinations]);

    return {
        // State
        destinations,
        filteredDestinations,
        categories,
        loading,
        error,
        searchTerm,
        selectedCategories,
        total,
        hasMore,

        // Actions
        setSearchTerm,
        setSelectedCategories,
        toggleCategory,
        clearFilters,
        loadMore,
        refresh
    };
};
