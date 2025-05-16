// src/components/Menu/FlatProductList.tsx
import React from 'react';
import { Product } from '../../types/restaurant.types'; // Adjust path
import ProductCard from '../ProductCard/ProductCard';
import './FlatProductList.scss';

interface FlatProductListProps {
  products: Product[];
  searchTerm: string;
}

const FlatProductList: React.FC<FlatProductListProps> = ({ products, searchTerm }) => {
  if (products.length === 0 && searchTerm) {
    return <p className="no-search-results">No items found for "{searchTerm}". Try a different search!</p>;
  }
  if (products.length === 0) {
    return <p className="no-menu-items">No menu items available.</p>;
  }

  return (
    <div className="flat-product-list-view">
      {searchTerm && <h2 className="search-results-title">Search Results for "{searchTerm}"</h2>}
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product.key} product={product} />
        ))}
      </div>
    </div>
  );
};

export default FlatProductList;
