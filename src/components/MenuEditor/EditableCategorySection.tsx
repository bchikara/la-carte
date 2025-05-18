// src/components/Admin/MenuEditor/EditableCategorySection.tsx
import React, { useState } from 'react';
import { MenuCategoryData } from '../../types/restaurant.types'; // Adjust path
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import EditableSubCategorySection from './EditableSubCategorySection'; // We'll create this next
import { FaEdit, FaPlusCircle, FaTrashAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './EditableCategorySection.scss'; // We'll create this SCSS file

interface EditableCategorySectionProps {
  category: MenuCategoryData;
  restaurantId: string;
}

const EditableCategorySection: React.FC<EditableCategorySectionProps> = ({ category, restaurantId }) => {
  const { openCategoryModal, deleteMenuCategory } = useRestaurantStore();
  const [isExpanded, setIsExpanded] = useState(true); // Categories expanded by default

  const handleEditCategory = () => {
    openCategoryModal('category', category, { restaurantId });
  };

  const handleAddSubCategory = () => {
    // When adding a subCategory, the parent context is the current main category
    openCategoryModal('subCategory', undefined, { restaurantId, categoryId: category.key });
  };
  
  const handleDeleteCategory = async () => {
    if (window.confirm(`Are you sure you want to delete the category "${category.name}" and all its contents? This cannot be undone.`)) {
        try {
            await deleteMenuCategory({id: restaurantId, menuCategoryId: category.key});
            // Optionally show success message via snackbar store
        } catch (error) {
            console.error("Error deleting category:", error);
            // Optionally show error message via snackbar store
        }
    }
  };

  return (
    <section className="editable-category-section">
      <header className="category-section-header">
        <div className="category-name-toggle" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <FaChevronUp className="toggle-icon" /> : <FaChevronDown className="toggle-icon" />}
          <h2>{category.name}</h2>
        </div>
        <div className="category-actions">
          <button onClick={handleEditCategory} className="admin-icon-button edit-btn" aria-label="Edit Category">
            <FaEdit /> <span>Edit</span>
          </button>
          <button onClick={handleAddSubCategory} className="admin-icon-button add-btn" aria-label="Add Sub-Category">
            <FaPlusCircle /> <span>Add Sub-Category</span>
          </button>
           <button onClick={handleDeleteCategory} className="admin-icon-button delete-btn" aria-label="Delete Category">
            <FaTrashAlt /> <span>Delete</span>
          </button>
        </div>
      </header>
      {isExpanded && (
        <div className="subcategories-container">
          {category.subCategories && category.subCategories.length > 0 ? (
            category.subCategories.map(subCategory => (
              <EditableSubCategorySection
                key={subCategory.key}
                subCategory={subCategory}
                restaurantId={restaurantId}
                mainCategoryId={category.key}
              />
            ))
          ) : (
            <p className="no-subcategories-message">
              No sub-categories yet.
              <span onClick={handleAddSubCategory} className="add-link"> Add one now.</span>
            </p>
          )}
        </div>
      )}
    </section>
  );
};

export default EditableCategorySection;
