// src/pages/Admin/AdminMenuEditorPage.tsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import EditableCategorySection from '../../components/MenuEditor/EditableCategorySection'; // We'll create this
import ProductEditModal from '../../components/MenuEditor/ProductEditModal'; // We'll create this
import CategoryEditModal from '../../components/MenuEditor/CategoryEditModal'; // We'll create this
import './MenuEditor.scss'; // We'll create this
import { FaPlusCircle, FaSpinner } from 'react-icons/fa';

const AdminMenuEditorPage: React.FC = () => {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const {
        currentRestaurant,
        currentRestaurantMenu,
        isLoadingMenu,
        errorMenu,
        listenToRestaurantAndMenu, // This fetches restaurant and processes menu
        stopListeningToRestaurantDetails, // This stops restaurant and its menu listener
        openCategoryModal,
        menuEditing, // To control modal visibility
    } = useRestaurantStore();

    useEffect(() => {
        if (restaurantId) {
            // listenToRestaurantAndMenu also fetches/processes the menu
            listenToRestaurantAndMenu(restaurantId);
        }
        return () => {
            if (restaurantId) {
                stopListeningToRestaurantDetails();
            }
        };
    }, [restaurantId, listenToRestaurantAndMenu, stopListeningToRestaurantDetails]);

    if (isLoadingMenu && !currentRestaurantMenu) {
        return (
            <div className="admin-menu-editor-page loading-state">
                <FaSpinner className="spinner-icon" />
                <p>Loading Menu...</p>
            </div>
        );
    }

    if (errorMenu) {
        return <div className="admin-menu-editor-page error-state">Error loading menu: {errorMenu}</div>;
    }

    if (!currentRestaurant) {
        return <div className="admin-menu-editor-page error-state">Restaurant not found.</div>;
    }
    
    const handleAddNewCategory = () => {
        openCategoryModal('category', undefined, { restaurantId });
    };

    return (
        <div className="admin-menu-editor-page">
            <header className="menu-editor-header">
                <h2>Menu Editor: {currentRestaurant.name}</h2>
                <button 
                    className="admin-cta-button add-category-button" 
                    onClick={handleAddNewCategory}
                >
                    <FaPlusCircle /> Add Main Category
                </button>
            </header>

            {currentRestaurantMenu && currentRestaurantMenu.length > 0 ? (
                <div className="menu-structure-container">
                    {currentRestaurantMenu.map(category => (
                        <EditableCategorySection 
                            key={category.key} 
                            category={category} 
                            restaurantId={restaurantId!}
                        />
                    ))}
                </div>
            ) : (
                !isLoadingMenu && <p className="no-menu-items-message">No menu categories found. Start by adding one!</p>
            )}

            {/* Modals for editing/adding items */}
            {menuEditing.isProductModalOpen && <ProductEditModal restaurantId={restaurantId!} />}
            {menuEditing.isCategoryModalOpen && <CategoryEditModal restaurantId={restaurantId!} />}
        </div>
    );
};

export default AdminMenuEditorPage;
