// src/components/Menu/ProductCard.tsx
import React, { useEffect, useState } from 'react';
import { Product } from '../../types/restaurant.types'; // Adjust path
import { useCartStore } from '../../store/cartStore'; // Adjust path
import VegIcon from '../../assets/icons/veg.svg'; // Ensure path is correct
import NonVegIcon from '../../assets/icons/non-veg.svg'; // Ensure path is correct
import './ProductCard.scss';
import { FaBookmark, FaRegBookmark, FaShareAlt } from 'react-icons/fa';

interface ProductCardProps {
  product: Product;
  restaurantId: string; // Add restaurantId prop
  // Optional: callback for when "read more" is clicked, if needed for analytics etc.
  // onReadMoreClick?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, restaurantId }) => {
  const { addToCart, removeFromCart, getCartItemQuantity } = useCartStore();
  const quantityInCart = getCartItemQuantity(product.key);

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false); // Example state

  const isVeg = product.veg == true;
  const description = product.description || "";
  const shortDescriptionLength = 70; // Characters to show before "read more"
  const canShowReadMore = description.length > shortDescriptionLength;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, restaurantId);
  };

  const handleRemoveFromCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromCart(product.key);
  };

  const toggleDescription = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click if "read more" is on the card itself
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    // Add actual bookmark logic here (e.g., API call, local storage)
    console.log(`${product.name} ${!isBookmarked ? 'bookmarked' : 'unbookmarked'}`);
  };

  const handleShare = (e: React.MouseEvent) => {
     e.stopPropagation();
    // Add actual share logic here (e.g., navigator.share or custom share modal)
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name}!`,
        url: window.location.href, // Or a specific product URL
      }).catch(console.error);
    } else {
      alert(`Share ${product.name}`); // Fallback
    }
  };

  useEffect(()=>{
    product.outofstock = false
  },[product])


  return (
    <div className={`product-card-redesigned ${product.outofstock ? 'outofstock' : ''}`}>
      <div className="product-info-column">
        <div className="product-header-info">
          <span className={`veg-indicator ${isVeg ? 'veg' : 'non-veg'}`}>
            <img src={isVeg ? VegIcon : NonVegIcon} alt={isVeg ? 'Vegetarian' : 'Non-Vegetarian'} />
          </span>
          <h3 className="product-name">{product.name}</h3>
        </div>

        <p className="product-price">₹{product.price}</p>

        <p className="product-description-text">
          {canShowReadMore && !isDescriptionExpanded 
            ? `${description.substring(0, shortDescriptionLength)}... ` 
            : description}
          {canShowReadMore && (
            <span onClick={toggleDescription} className="read-more-btn">
              {isDescriptionExpanded ? ' read less' : ' read more'}
            </span>
          )}
        </p>
        
        {/* <div className="product-meta-actions">
            <button onClick={handleBookmark} className="meta-action-btn bookmark-btn" aria-label="Bookmark">
                {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
            </button>
            <button onClick={handleShare} className="meta-action-btn share-btn" aria-label="Share">
                <FaShareAlt />
            </button>
        </div> */}
      </div>

      <div className="product-image-add-column">
        <div className="product-image-wrapper-redesigned">
          <img
            src={product.icon || `https://placehold.co/150x150/${isVeg ? '4CAF50' : 'f44336'}/FFFFFF?text=${encodeURIComponent(product.name[0])}`}
            alt={product.name}
            className="product-image-redesigned"
            onError={(e) => (e.currentTarget.src = `https://placehold.co/150x150/cccccc/FFFFFF?text=Error`)}
            loading="lazy"
          />
          {product.outofstock && <div className="outofstock-badge">Out of Stock</div>}
        </div>
        <div className="product-add-action">
          {product.outofstock ? (
            <button className="add-button-redesigned disabled" disabled>Add</button>
          ) : quantityInCart === 0 ? (
            <button className="add-button-redesigned" onClick={handleAddToCart}>
              ADD <span className="plus-icon">+</span>
            </button>
          ) : (
            <div className="quantity-control-redesigned">
              <button onClick={handleRemoveFromCart}>-</button>
              <span>{quantityInCart}</span>
              <button onClick={handleAddToCart}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
