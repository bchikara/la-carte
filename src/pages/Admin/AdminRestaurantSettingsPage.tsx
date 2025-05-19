import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import RestaurantDetailsForm from '../../components/Admin/RestaurantDetailsForm'; // We'll create this
import AdminTableManager from '../../components/Admin/AdminTableManager'; // We'll create this
import TableEditModal from '../../components/Admin/TableEditModal'; // We'll create this
import './AdminRestaurantSettingsPage.scss'; // We'll create this
import { FaSpinner } from 'react-icons/fa';

const AdminRestaurantSettingsPage: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const {
        currentRestaurant,
        isLoadingDetails, // Use this to track loading of restaurant details
        error,
        listenToRestaurantAndMenu, // This fetches restaurant details including tables if structured so
        stopListeningToRestaurantDetails,
        menuEditing, // To control TableEditModal visibility
    } = useRestaurantStore();

    useEffect(() => {
        if (restaurantId && !currentRestaurant) { // Fetch if not already loaded or different
            console.log(currentRestaurant)
            listenToRestaurantAndMenu(restaurantId);
        }
        return () => {
            if (restaurantId) {
                // stopListeningToRestaurantDetails(); // Listener is stopped by AdminLayout on unmount of parent route
            }
        };
    }, [restaurantId, listenToRestaurantAndMenu, currentRestaurant]);


    if (isLoadingDetails && !currentRestaurant) {
        return (
            <div className="admin-settings-page loading-state">
                <FaSpinner className="spinner-icon" />
                <p>Loading Restaurant Settings...</p>
            </div>
        );
    }

    if (error) {
        return <div className="admin-settings-page error-state">Error loading restaurant details: {error}</div>;
    }

    if (!currentRestaurant) {
        return <div className="admin-settings-page error-state">Restaurant data not found.</div>;
    }

    return (
        <div className="admin-settings-page">
            <header className="settings-page-header">
                <h1>Restaurant Settings: {currentRestaurant.name}</h1>
                <p>Manage your restaurant's information and table setup.</p>
            </header>

            <div className="settings-sections-container">
                <section className="settings-section restaurant-details-section">
                    <h2>General Information</h2>
                    <RestaurantDetailsForm restaurant={currentRestaurant} restaurantId={restaurantId!} />
                </section>

                <section className="settings-section table-management-section">
                    <h2>Table Management & QR Codes</h2>
                    <AdminTableManager restaurant={currentRestaurant} restaurantId={restaurantId!} />
                </section>
            </div>

            {/* Modal for adding/editing tables, controlled by restaurantStore.menuEditing.isTableModalOpen */}
            {menuEditing.isTableModalOpen && <TableEditModal restaurantId={restaurantId!} />}
        </div>
    );
};

export default AdminRestaurantSettingsPage;
