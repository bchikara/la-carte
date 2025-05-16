// src/components/Menu/MenuAccordion.tsx
import React, { useState } from 'react';
import { MenuCategoryData, MenuSubCategoryData } from '../../types/restaurant.types'; // Adjust path
import ProductCard from '../ProductCard/ProductCard';
import DownArrowIcon from '../../assets/icons/down-arrow.svg'; // Ensure path
import './MenuAccordion.scss';

interface MenuAccordionProps {
  categories: MenuCategoryData[];
}

const CategorySection: React.FC<{ category: MenuCategoryData }> = ({ category }) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(true); // Default open

  return (
    <div className="menu-category-section">
      <button
        className="accordion-toggle category-toggle"
        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
        aria-expanded={isCategoryOpen}
        aria-controls={`category-content-${category.key}`}
        id={`category-header-${category.key}`} // For scrolling
      >
        <h3>{category.name}</h3>
        <img src={DownArrowIcon} alt="toggle" className={`arrow-icon ${isCategoryOpen ? 'open' : ''}`} />
      </button>
      <div
        id={`category-content-${category.key}`}
        className={`accordion-content category-content ${isCategoryOpen ? 'open' : ''}`}
        role="region"
        aria-labelledby={`category-header-${category.key}`}
      >
        {category.subCategories.map(subCategory => (
          <SubCategorySection key={subCategory.key} subCategory={subCategory} />
        ))}
      </div>
    </div>
  );
};

const SubCategorySection: React.FC<{ subCategory: MenuSubCategoryData }> = ({ subCategory }) => {
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(true); // Default open

  // If subcategory name is empty or just "default", don't render its header, just products
  const renderSubCategoryHeader = subCategory.name && subCategory.name.toLowerCase() !== 'default';

  return (
    <div className="menu-subcategory-section">
      {renderSubCategoryHeader && (
        <button
          className="accordion-toggle subcategory-toggle"
          onClick={() => setIsSubCategoryOpen(!isSubCategoryOpen)}
          aria-expanded={isSubCategoryOpen}
          aria-controls={`subcategory-content-${subCategory.key}`}
        >
          <h4>{subCategory.name}</h4>
          <img src={DownArrowIcon} alt="toggle" className={`arrow-icon ${isSubCategoryOpen ? 'open' : ''}`} />
        </button>
      )}
      <div
        id={`subcategory-content-${subCategory.key}`}
        className={`accordion-content subcategory-content ${isSubCategoryOpen || !renderSubCategoryHeader ? 'open' : ''}`}
        role="region"
        aria-labelledby={renderSubCategoryHeader ? `subcategory-header-${subCategory.key}` : undefined}
      >
        <div className="products-grid">
          {subCategory.products.map(product => (
            <ProductCard key={product.key} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};


const MenuAccordion: React.FC<MenuAccordionProps> = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return <p className="no-menu-items">No menu items available at the moment.</p>;
  }

  return (
    <div className="menu-accordion-view">
      {categories.map(category => (
        <CategorySection key={category.key} category={category} />
      ))}
    </div>
  );
};

export default MenuAccordion;
