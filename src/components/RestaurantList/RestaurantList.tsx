// src/components/RestaurantList/RestaurantList.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path as needed
import { Restaurant } from '../../types/restaurant.types'; // Adjust path as needed
import { getUserLocation, getDistanceToRestaurant, formatDistance, UserLocation } from '../../utils/geolocation';
import './RestaurantList.scss';

// Import icons from React Icons (Font Awesome set)
import { FaMapMarkerAlt, FaSearch, FaDirections, FaLocationArrow } from 'react-icons/fa';

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
        error
    } = useRestaurantStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'distance'>('name');
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Get user location on component mount
    useEffect(() => {
        const fetchUserLocation = async () => {
            setIsLoadingLocation(true);
            const location = await getUserLocation();
            setUserLocation(location);
            setIsLoadingLocation(false);

            if (location) {
                console.log('User location obtained:', location);
            } else {
                console.log('User location not available');
            }
        };

        fetchUserLocation();
    }, []);

    const filteredAndSortedRestaurants = useMemo(() => {
        // First, filter restaurants
        let filtered = restaurantsList.filter(restaurant => {
            const nameMatches = restaurant.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
            const locationMatches = selectedLocation
                ? restaurant.location?.toLowerCase().includes(selectedLocation.toLowerCase())
                : true;
            return nameMatches && locationMatches;
        });

        // Then, sort restaurants
        if (sortBy === 'distance' && userLocation) {
            filtered = [...filtered].sort((a, b) => {
                const distanceA = getDistanceToRestaurant(userLocation, a.coordinates);
                const distanceB = getDistanceToRestaurant(userLocation, b.coordinates);

                // Put restaurants without coordinates at the end
                if (distanceA === null) return 1;
                if (distanceB === null) return -1;

                return distanceA - distanceB;
            });
        } else {
            // Sort by name alphabetically
            filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        }

        return filtered;
    }, [restaurantsList, debouncedSearchTerm, selectedLocation, sortBy, userLocation]);

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

    const handleGetDirections = (e: React.MouseEvent, lat?: number, lng?: number) => {
        e.stopPropagation(); // Prevent card click
        if (lat && lng) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
            window.open(url, '_blank');
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

                <div className="filter-item sort-filter">
                    <FaLocationArrow className="filter-react-icon" />
                    <select
                        name="sortBy"
                        id="sortByFilter"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'name' | 'distance')}
                        disabled={!userLocation && sortBy === 'distance'}
                    >
                        <option value="name">Sort by Name</option>
                        <option value="distance" disabled={!userLocation}>
                            {userLocation ? 'Sort by Distance' : 'Distance (Location Required)'}
                        </option>
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

            {userLocation && sortBy === 'distance' && (
                <div className="location-info">
                    <FaLocationArrow className="location-icon" />
                    <span>Showing restaurants sorted by distance from your location</span>
                </div>
            )}

            {filteredAndSortedRestaurants.length > 0 ? (
                <div className="restaurants-grid">
                    {filteredAndSortedRestaurants.map((item) => {
                        const distance = userLocation ? getDistanceToRestaurant(userLocation, item.coordinates) : null;
                        return (
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

                                <div className="restaurant-card-info">
                                    {item.location && (
                                        <p className="restaurant-card-location">
                                            <FaMapMarkerAlt className="location-pin-icon" /> {item.location}
                                        </p>
                                    )}
                                    {distance !== null && (
                                        <p className="restaurant-card-distance">
                                            <FaLocationArrow className="distance-icon" /> {formatDistance(distance)}
                                        </p>
                                    )}
                                </div>

                                {item.coordinates && (
                                    <button
                                        className="get-directions-btn"
                                        onClick={(e) => handleGetDirections(e, item.coordinates?.lat, item.coordinates?.lng)}
                                    >
                                        <FaDirections /> Get Directions
                                    </button>
                                )}
                            </div>
                        </div>
                        );
                    })}
                </div>
            ) : !isLoadingList ? (
                 <div className="no-results-state">
                    <p>No restaurants found matching your criteria. Try adjusting your filters or explore all options!</p>
                </div>
            ) : null}
        </div>
    );
};

export default RestaurantList;
