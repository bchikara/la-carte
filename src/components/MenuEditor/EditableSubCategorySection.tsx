// src/components/Admin/MenuEditor/EditableSubCategorySection.tsx
import React, { useState } from 'react';
import { MenuSubCategoryData } from '../../types/restaurant.types'; // Adjust path
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import EditableProductListItem from './EditableProductListItem'; // We'll create this next
import { FaEdit, FaPlusCircle, FaTrashAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './EditableSubCategorySection.scss'; // We'll create this SCSS file

interface EditableSubCategorySectionProps {
  subCategory: MenuSubCategoryData;
  restaurantId: string;
  mainCategoryId: string; // To provide context for adding/editing products
}

const EditableSubCategorySection: React.FC<EditableSubCategorySectionProps> = ({ subCategory, restaurantId, mainCategoryId }) => {
  const { openCategoryModal, openProductModal, deleteMenuCategory, deleteMenuSubCategory /* needs deleteMenuSubCategory */ } = useRestaurantStore();
  const [isExpanded, setIsExpanded] = useState(true); // Sub-categories expanded by default

  const handleEditSubCategory = () => {
    openCategoryModal('subCategory', subCategory, { restaurantId, categoryId: mainCategoryId });
  };

  const handleAddProduct = () => {
    openProductModal(undefined, { restaurantId, categoryId: mainCategoryId, subCategoryId: subCategory.key });
  };

  const handleDeleteSubCategory = async () => {
    // IMPORTANT: Your restaurantService and restaurantStore will need a specific
    // method to delete a sub-category, as it's nested.
    // For example: deleteMenuSubCategory({ restaurantId, menuCategoryId, subCategoryId })
    if (window.confirm(`Are you sure you want to delete the sub-category "${subCategory.name}" and all its products? This cannot be undone.`)) {
        try {
            // This is a placeholder. You need a specific service/store action.
            // await deleteMenuSubCategory({ restaurantId, menuCategoryId: mainCategoryId, subCategoryId: subCategory.key });
            // console.warn("Delete sub-category functionality needs to be implemented in store/service.");
            // alert("Delete sub-category functionality is not yet fully implemented.");
            // Example of how it might be called if using deleteMenuCategory with a more specific path,
            // but this is not ideal as deleteMenuCategory expects RestaurantMenuCategoryPathKeys.
            await deleteMenuSubCategory({id: restaurantId, menuCategoryId: mainCategoryId, subCategoryId: subCategory.key });
        } catch (error) {
            console.error("Error deleting sub-category:", error);
        }
    }
  };
  
  // If subCategory name is empty or "default", we might not want to render its header,
  // and just display its products directly under the main category.
  // This logic was in MenuAccordion, adapting it here.
  const shouldRenderHeader = subCategory.name && subCategory.name.trim() !== '' && subCategory.name.toLowerCase() !== 'default';


  return (
    <section className="editable-sub-category-section">
      {shouldRenderHeader && (
        <header className="subcategory-section-header">
          <div className="subcategory-name-toggle" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <FaChevronUp className="toggle-icon" /> : <FaChevronDown className="toggle-icon" />}
            <h3>{subCategory.name}</h3>
          </div>
          <div className="subcategory-actions">
            <button onClick={handleEditSubCategory} className="admin-icon-button edit-btn" aria-label="Edit Sub-Category">
              <FaEdit /> <span>Edit</span>
            </button>
            <button onClick={handleAddProduct} className="admin-icon-button add-btn" aria-label="Add Product to this Sub-Category">
              <FaPlusCircle /> <span>Add Product</span>
            </button>
            <button onClick={handleDeleteSubCategory} className="admin-icon-button delete-btn" aria-label="Delete Sub-Category">
              <FaTrashAlt /> <span>Delete</span>
            </button>
          </div>
        </header>
      )}

      {(isExpanded || !shouldRenderHeader) && (
        <div className={`products-list-container ${!shouldRenderHeader ? 'no-header' : ''}`}>
          {subCategory.products && subCategory.products.length > 0 ? (
            subCategory.products.map(product => (
              <EditableProductListItem
                key={product.key}
                product={product}
                restaurantId={restaurantId}
                mainCategoryId={mainCategoryId}
                subCategoryId={subCategory.key}
              />
            ))
          ) : (
            <p className="no-products-message">
              No products in this sub-category yet.
              <span onClick={handleAddProduct} className="add-link"> Add a product.</span>
            </p>
          )}
          {/* Add Product button if the subcategory header is not rendered (e.g. "default" subcategory) */}
          {!shouldRenderHeader && subCategory.products.length === 0 && (
             <div className="add-product-footer-action">
                <button onClick={handleAddProduct} className="admin-cta-button subtle">
                    <FaPlusCircle /> Add First Product
                </button>
            </div>
          )}
           {!shouldRenderHeader && subCategory.products.length > 0 && (
             <div className="add-product-footer-action">
                <button onClick={handleAddProduct} className="admin-cta-button subtle">
                    <FaPlusCircle /> Add Another Product
                </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default EditableSubCategorySection;
