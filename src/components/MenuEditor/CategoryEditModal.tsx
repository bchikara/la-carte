// src/components/Admin/MenuEditor/CategoryEditModal.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import { MenuCategoryData, MenuSubCategoryData, MenuCategory } from '../../types/restaurant.types'; // Adjust path
import './CategoryEditModal.scss'; // We'll create this
import { FaTimes, FaSpinner, FaSave } from 'react-icons/fa';

interface CategoryEditModalProps {
  restaurantId: string;
  // Editing context (item, type, parent IDs) will come from the store's menuEditing state
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({ restaurantId }) => {
  const {
    menuEditing,
    closeCategoryModal,
    addMenuCategory,
    updateMenuCategory,
    addMenuSubCategory
    // You'll likely need dedicated actions for subcategories in your store
    // e.g., addMenuSubCategory, updateMenuSubCategory
    // For now, we'll try to adapt or placeholder them
  } = useRestaurantStore();

  const { editingItem, editingItemType, parentContext, isCategoryModalOpen } = menuEditing;
  
  const isEditing = !!editingItem;
  const isSubCategory = editingItemType === 'subCategory';

  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isCategoryModalOpen) {
        if (isEditing && editingItem) {
            // Type guard to satisfy TypeScript
            if ('name' in editingItem) { // Common property for MenuCategoryData and MenuSubCategoryData
                 setCategoryName(editingItem.name);
            }
            if ('description' in editingItem && editingItem.description) {
                setDescription(editingItem.description);
            } else {
                setDescription('');
            }
        } else {
            // Reset for new category/subcategory
            setCategoryName('');
            setDescription('');
        }
    }
  }, [isEditing, editingItem, editingItemType, isCategoryModalOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert(`Please enter a valid ${isSubCategory ? 'sub-category' : 'category'} name.`);
      return;
    }
    if (!restaurantId) {
        alert("Restaurant context is missing.");
        return;
    }

    setIsLoading(true);

    try {
      if (isSubCategory) {
        // --- Sub-Category Logic ---
        if (!parentContext?.categoryId) {
            alert("Main category context is missing for sub-category.");
            setIsLoading(false);
            return;
        }
        const subCategoryData = {
          name: categoryName.trim(),
          description: description.trim(),
          // products: isEditing && (editingItem as MenuSubCategoryData).products ? (editingItem as MenuSubCategoryData).products : {} // Preserve products if editing
        };

        if (isEditing && editingItem) {
          // IMPORTANT: updateMenuSubCategory action and service method needed
          // For now, using updateMenuCategory with a modified path (not ideal, placeholder)
          console.warn("updateMenuSubCategory functionality is using a placeholder with updateMenuCategory.");
          await updateMenuCategory(
            { id: restaurantId, menuCategoryId: parentContext.categoryId + '/subCategory/' + (editingItem as MenuSubCategoryData).key }, // This path is conceptual
            subCategoryData as Partial<MenuCategory> // Type assertion, be careful
          );
          alert("Sub-category update needs dedicated service/store action.");
        } else {
          // IMPORTANT: addMenuSubCategory action and service method needed
          // For now, using addMenuCategory with a modified path (not ideal, placeholder)
          console.warn("addMenuSubCategory functionality is using a placeholder with addMenuCategory.");
          // This conceptual call would require addMenuCategory to handle nested paths or a new service method
          // await addMenuCategory(restaurantId + '/menu/' + parentContext.categoryId + '/subCategories', subCategoryData);
          alert("Add sub-category needs dedicated service/store action. Placeholder for now.");
          // Example of how it might look if you had a specific service method:
          addMenuSubCategory(restaurantId, parentContext.categoryId, subCategoryData)
          // await restaurantService.addMenuSubCategory({ restaurantId, menuCategoryId: parentContext.categoryId }, subCategoryData);
        }

      } else {
        // --- Main Category Logic ---
        const categoryData: Omit<MenuCategory, 'id' | 'subCategory'> = { // Ensure MenuCategory type is appropriate
          name: categoryName.trim(),
          description: description.trim(),
        };

        if (isEditing && editingItem) {
          await updateMenuCategory(
            { id: restaurantId, menuCategoryId: (editingItem as MenuCategoryData).key },
            categoryData
          );
        } else {
          await addMenuCategory(restaurantId, categoryData as Omit<MenuCategory, 'id'>);
        }
      }
      closeCategoryModal();
    } catch (error) {
      console.error(`Error saving ${editingItemType}:`, error);
      alert(`Error saving ${editingItemType}: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isCategoryModalOpen) {
    return null;
  }

  const modalTitle = isEditing 
    ? `Edit ${isSubCategory ? 'Sub-Category' : 'Category'}` 
    : `Add New ${isSubCategory ? 'Sub-Category' : 'Category'}`;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content category-edit-modal">
        <header className="admin-modal-header">
          <h2>{modalTitle}</h2>
          <button onClick={closeCategoryModal} className="close-modal-btn" aria-label="Close modal">
            <FaTimes />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="form-field">
            <label htmlFor="categoryName">{isSubCategory ? 'Sub-Category' : 'Category'} Name</label>
            <input
              id="categoryName"
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-field">
            <label htmlFor="categoryDescription">Description (Optional)</label>
            <textarea
              id="categoryDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>
          <div className="admin-modal-actions">
            <button type="button" onClick={closeCategoryModal} className="cta-button tertiary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="cta-button primary" disabled={isLoading}>
              {isLoading ? <FaSpinner className="spinner-icon inline" /> : <FaSave />}
              {isEditing ? 'Save Changes' : `Add ${isSubCategory ? 'Sub-Category' : 'Category'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEditModal;
