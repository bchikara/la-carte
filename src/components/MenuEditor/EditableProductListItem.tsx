import React from 'react';
import { Product as MenuProductType } from '../../types/restaurant.types'; // Adjust path, aliased as MenuProductType
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import VegIcon from '../../assets/icons/veg.svg'; // Ensure path
import NonVegIcon from '../../assets/icons/non-veg.svg'; // Ensure path
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import './EditableProductListItem.scss'; // We'll create this SCSS file

interface EditableProductListItemProps {
  product: MenuProductType;
  restaurantId: string;
  mainCategoryId: string;
  subCategoryId: string;
}

const EditableProductListItem: React.FC<EditableProductListItemProps> = ({
  product,
  restaurantId,
  mainCategoryId,
  subCategoryId,
}) => {
  const { openProductModal, deleteMenuItem } = useRestaurantStore();

  const handleEditProduct = () => {
    openProductModal(product, { restaurantId, categoryId: mainCategoryId, subCategoryId });
  };

  const handleDeleteProduct = async () => {
    if (window.confirm(`Are you sure you want to delete the product "${product.name}"? This cannot be undone.`)) {
      try {
        await deleteMenuItem({
          id: restaurantId,
          menuCategoryId: mainCategoryId,
          subCategoryId: subCategoryId,
          menuItemId: product.key, // 'key' from Product is the Firebase key (ID)
        });
        // Optionally show success message via snackbar store
      } catch (error) {
        console.error("Error deleting product:", error);
        // Optionally show error message via snackbar store
      }
    }
  };

  const isVeg = product.veg === true; // Assuming product.veg is boolean after processing

  return (
    <div className={`editable-product-list-item ${product.outofstock ? 'outofstock' : ''}`}>
      <div className="product-item-info">
        <span className={`veg-indicator ${isVeg ? 'veg' : 'non-veg'}`}>
          <img src={isVeg ? VegIcon : NonVegIcon} alt={isVeg ? 'Veg' : 'Non-Veg'} />
        </span>
        <span className="product-item-name">{product.name}</span>
        <span className="product-item-price">₹{product.price.toFixed(2)}</span>
        {product.outofstock && <span className="outofstock-tag">Out of Stock</span>}
      </div>
      <div className="product-item-actions">
        <button onClick={handleEditProduct} className="admin-icon-button edit-btn" aria-label="Edit Product">
          <FaEdit /> <span>Edit</span>
        </button>
        <button onClick={handleDeleteProduct} className="admin-icon-button delete-btn" aria-label="Delete Product">
          <FaTrashAlt /> <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default EditableProductListItem;
