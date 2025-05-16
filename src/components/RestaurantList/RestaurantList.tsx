// src/components/RestaurantList/RestaurantList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path as needed
import { Restaurant } from '../../types/restaurant.types'; // Adjust path as needed
import './RestaurantList.scss'; 

// Import icons from React Icons (Font Awesome set)
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';

// Debounce hook (can be moved to a utils/hooks folder)
const useDebounce = (value: string, delay: number): string => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const RestaurantList: React.FC = () => {
    const navigate = useNavigate();
    const { 
        restaurantsList, 
        isLoadingList, 
        error, 
        listenToAllRestaurants, 
        stopListeningToAllRestaurants 
    } = useRestaurantStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    useEffect(() => {
        listenToAllRestaurants();
        return () => {
            stopListeningToAllRestaurants();
        };
    }, [listenToAllRestaurants, stopListeningToAllRestaurants]);

    const filteredRestaurants = useMemo(() => {
        return restaurantsList.filter(restaurant => {
            const nameMatches = restaurant.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const locationMatches = selectedLocation 
                ? restaurant.location?.toLowerCase().includes(selectedLocation.toLowerCase()) 
                : true;
            return nameMatches && locationMatches;
        });
    }, [restaurantsList, debouncedSearchTerm, selectedLocation]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedLocation(e.target.value);
    };

    const goToRestaurant = (id: string) => {
        if (id) {
            navigate(`/menu/${id}`);
        }
    };

    const uniqueLocations = useMemo(() => {
        const locations = new Set(
            restaurantsList
                .map(r => r.location)
                .filter((loc): loc is string => typeof loc === 'string' && loc.trim() !== '')
        );
        return Array.from(locations).sort();
    }, [restaurantsList]);

    if (isLoadingList && restaurantsList.length === 0) {
        return <div className="loading-state">Loading restaurants...</div>;
    }

    if (error) {
        return <div className="error-state">Error loading restaurants: {error}</div>;
    }

    return (
        <div className="takeaway-content-wrapper">
            <div className="filters-container">
                <div className="filter-item location-filter">
                    <FaMapMarkerAlt className="filter-react-icon" />
                    <select name="location" id="locationFilter" value={selectedLocation} onChange={handleLocationChange}>
                        <option value="">All Locations</option>
                        {uniqueLocations.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                        { !uniqueLocations.includes("Pushkar") && <option value="Pushkar">Pushkar</option>}
                    </select>
                </div>
                <div className="filter-item search-filter">
                    <FaSearch className="filter-react-icon" />
                    <input
                        type="text"
                        placeholder="Search restaurant by name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {filteredRestaurants.length > 0 ? (
                <div className="restaurants-grid">
                    {filteredRestaurants.map((item) => (
                        <div className="restaurant-card" key={item.id || item.key} onClick={() => goToRestaurant(item.id || item.key!)}>
                            <div className="restaurant-card-image-wrapper">
                                <img 
                                    src={item.profilePic || `https://placehold.co/300x200/e08f00/FFFFFF?text=${encodeURIComponent(item.name)}`} 
                                    alt={`${item.name} restaurant`} 
                                    className="restaurant-card-image"
                                    onError={(e) => (e.currentTarget.src = `https://placehold.co/300x200/cccccc/FFFFFF?text=No+Image`)}
                                    loading="lazy"
                                />
                            </div>
                            <div className="restaurant-card-content">
                                <h3 className="restaurant-card-name">{item.name}</h3>
                                {item.location && (
                                    <p className="restaurant-card-location">
                                        <FaMapMarkerAlt className="location-pin-icon" /> {item.location}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="no-results-state">
                    <p>No restaurants found matching your criteria. Try adjusting your filters or explore all options!</p>
                </div>
            )}
        </div>
    );
};

export default RestaurantList;
