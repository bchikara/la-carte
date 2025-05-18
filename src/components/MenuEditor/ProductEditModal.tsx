// src/components/Admin/MenuEditor/ProductEditModal.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import { MenuItem, Product as MenuProductType, RawProductFirebase } from '../../types/restaurant.types'; // Adjust path
import './ProductEditModal.scss'; // We'll create this
import { FaTimes, FaSpinner, FaSave, FaImage } from 'react-icons/fa';

interface ProductEditModalProps {
  restaurantId: string;
  // Note: editingItem and parentContext will come from the store's menuEditing state
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({ restaurantId }) => {
  const {
    menuEditing,
    closeProductModal,
    addMenuItem,
    updateMenuItem,
  } = useRestaurantStore();

  const isEditing = !!menuEditing.editingItem && menuEditing.editingItemType === 'product';
  const currentProduct = menuEditing.editingItem as MenuProductType | null;
  const { categoryId, subCategoryId } = menuEditing.parentContext || {};

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string | number>('');
  const [isVeg, setIsVeg] = useState(true);
  const [isOutOfStock, setIsOutOfStock] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditing && currentProduct) {
      setProductName(currentProduct.name);
      setDescription(currentProduct.description || '');
      setPrice(currentProduct.price);
      setIsVeg(currentProduct.veg === true); // Ensure boolean
      setIsOutOfStock(currentProduct.outofstock || false);
      setIconPreview(currentProduct.icon || null);
      setIconFile(null); // Reset file input when opening for edit
    } else {
      // Reset form for adding new product
      setProductName('');
      setDescription('');
      setPrice('');
      setIsVeg(true);
      setIsOutOfStock(false);
      setIconPreview(null);
      setIconFile(null);
    }
  }, [isEditing, currentProduct, menuEditing.isProductModalOpen]); // Depend on modal open state to reset

 useEffect(() => {
    if (iconFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setIconPreview(reader.result as string);
        };
        reader.readAsDataURL(iconFile);
    } else if (isEditing && currentProduct?.icon) {
        setIconPreview(currentProduct.icon);
    } else {
        setIconPreview(null); // No file and no existing icon
    }
  }, [iconFile, isEditing, currentProduct]);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIconFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !price || isNaN(Number(price)) || Number(price) < 0) {
      alert('Please enter a valid product name and price.');
      return;
    }
    if (!categoryId || !subCategoryId) {
        alert('Category context is missing. Cannot save product.');
        console.error("Missing categoryId or subCategoryId in product modal context", menuEditing.parentContext);
        return;
    }

    setIsLoading(true);

    // TODO: Implement actual image upload to Firebase Storage here
    // For now, we'll assume icon is a URL or placeholder
    let uploadedIconUrl = currentProduct?.icon || null; // Keep existing if not changed
    if (iconFile) {
        // Placeholder for upload logic
        console.log("Simulating image upload for:", iconFile.name);
        // For now, using a placeholder or the preview if it's a data URL (not ideal for DB)
        uploadedIconUrl = iconPreview; // This would be the data URL if not uploaded
        // In a real app: uploadedIconUrl = await uploadImageToFirebaseStorage(iconFile, `restaurants/${restaurantId}/menuItems/`);
        alert("Image upload functionality is a placeholder. Using preview or existing URL.");
    }


    const productData: Omit<MenuItem, 'id' | 'categoryName' | 'subCategoryName'> = {
      name: productName.trim(),
      description: description.trim(),
      price: Number(price),
      veg: isVeg,
      outOfStock: isOutOfStock, // Ensure this matches the 'MenuItem' type from restaurant.types.ts
      imageUrl: uploadedIconUrl, // MenuItem type has imageUrl
      // Add other fields that MenuItem expects
    };

    try {
      if (isEditing && currentProduct) {
        await updateMenuItem(
          { id: restaurantId, menuCategoryId: categoryId, subCategoryId: subCategoryId, menuItemId: currentProduct.key },
          productData,
          iconFile
        );
      } else {
        await addMenuItem(
          { id: restaurantId, menuCategoryId: categoryId, subCategoryId: subCategoryId },
          productData,
          iconFile
        );
      }
      closeProductModal();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Error saving product: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!menuEditing.isProductModalOpen) {
    return null;
  }

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-content product-edit-modal">
        <header className="admin-modal-header">
          <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={closeProductModal} className="close-modal-btn" aria-label="Close modal">
            <FaTimes />
          </button>
        </header>
        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="form-field">
            <label htmlFor="productName">Product Name</label>
            <input
              id="productName"
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-field">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>
          <div className="form-field">
            <label htmlFor="price">Price (₹)</label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
              disabled={isLoading}
            />
          </div>
          <div className="form-field-row">
            <div className="form-field checkbox-field">
              <input
                id="isVeg"
                type="checkbox"
                checked={isVeg}
                onChange={(e) => setIsVeg(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="isVeg">Vegetarian</label>
            </div>
            <div className="form-field checkbox-field">
              <input
                id="isOutOfStock"
                type="checkbox"
                checked={isOutOfStock}
                onChange={(e) => setIsOutOfStock(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="isOutOfStock">Out of Stock</label>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="productIcon">Product Image (Optional)</label>
            <div className="image-upload-preview">
                {iconPreview ? (
                    <img src={iconPreview} alt="Product preview" className="icon-preview"/>
                ) : (
                    <div className="icon-placeholder"><FaImage /></div>
                )}
                <input
                    type="file"
                    id="productIcon"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                />
                 <label htmlFor="productIcon" className="upload-file-btn cta-button tertiary small">
                    {iconFile ? "Change Image" : "Upload Image"}
                </label>
            </div>
          </div>


          <div className="admin-modal-actions">
            <button type="button" onClick={closeProductModal} className="cta-button tertiary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="cta-button primary" disabled={isLoading}>
              {isLoading ? <FaSpinner className="spinner-icon inline" /> : <FaSave />}
              {isEditing ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
