// src/pages/Menu/Menu.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useRestaurantStore } from '../../store/restaurantStore'; // Adjust path
import { useCartStore } from '../../store/cartStore'; // Adjust path
import { Product, MenuCategoryData, ProcessedMenu } from '../../types/restaurant.types'; // Adjust path
import MenuAccordion from '../../components/MenuAccordion/MenuAccordion'; // Adjust path
import FlatProductList from '../../components/FlatProductList/FlatProductList'; // Adjust path
import MenuIcon from '../../assets/icons/menu book.svg'; // Ensure path
import TableIcon from '../../assets/icons/table.svg'; // Ensure path
// import SearchIcon from '../../assets/search.svg'; // For search input, if needed as bg
import './Menu.scss';

// Debounce hook
const useDebounce = (value: string, delay: number): string => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const Menu: React.FC = () => {
    const { id: restaurantId } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { 
        currentRestaurant, 
        currentRestaurantMenu, 
        isLoadingMenu, 
        errorMenu, 
        listenToRestaurantAndMenu, 
        stopListeningToRestaurantDetails // Assuming this also stops menu listener
    } = useRestaurantStore();
    
    const { totalItems: cartLength } = useCartStore();

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [isSearchActive, setIsSearchActive] = useState(false);
    
    const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);
    const [isSearchSticked, setIsSearchSticked] = useState(false);

    useEffect(() => {
        if (restaurantId) {
            listenToRestaurantAndMenu(restaurantId);
        }
        return () => {
            if (restaurantId) {
                stopListeningToRestaurantDetails(); // Or a specific stopMenuListener
            }
        };
    }, [restaurantId, listenToRestaurantAndMenu, stopListeningToRestaurantDetails]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const searchMenuElement = document.querySelector('.MenuPage .search-menu-wrapper');
        if (!searchMenuElement) return;

        const searchHeight = (searchMenuElement as HTMLElement).offsetTop;
        
        const handleScroll = () => {
            if (window.scrollY > searchHeight) {
                setIsSearchSticked(true);
            } else {
                setIsSearchSticked(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentRestaurantMenu]); // Re-check if menu loaded and search bar is present

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        setIsSearchActive(term.length > 0);
    };

    const filteredProductsForList = useMemo((): Product[] => {
        if (!debouncedSearchTerm || !currentRestaurantMenu) return [];
        const allProducts: Product[] = [];
        currentRestaurantMenu.forEach(category => {
            category.subCategories.forEach(subCategory => {
                subCategory.products.forEach(product => {
                    if (product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                        category.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                        subCategory.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                        product.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
                    ) {
                        allProducts.push(product);
                    }
                });
            });
        });
        return allProducts;
    }, [debouncedSearchTerm, currentRestaurantMenu]);

    const scrollToCategory = (categoryId: string) => {
        const element = document.getElementById(`category-header-${categoryId}`);
        if (element) {
            const headerOffset = 120; // Adjust based on your sticky header/search bar height
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
        setIsFloatingMenuOpen(false); // Close menu after scroll
    };

    const tableNumber = searchParams.get('table');
    const getTableName = () => {
        if (!tableNumber || !currentRestaurant?.tables) return 'Take-away / Delivery';
        const tableKey = Object.keys(currentRestaurant.tables)[parseInt(tableNumber) -1];
        return currentRestaurant.tables[tableKey]?.name || `Table ${tableNumber}`;
    };


    if (isLoadingMenu && !currentRestaurantMenu) {
        return <div className="menu-loading-state">Loading Menu...</div>;
    }

    if (errorMenu) {
        return <div className="menu-error-state">Error loading menu: {errorMenu}</div>;
    }

    if (!currentRestaurant || !currentRestaurantMenu) {
        return <div className="menu-error-state">Restaurant details not found.</div>;
    }

    return (
        <div className="MenuPage">
            {/* Watermark applied via SCSS pseudo-element */}
            
            <header className="menu-page-header">
                <h1 className="restaurant-name-title">{currentRestaurant.name}</h1>
                {tableNumber && (
                    <p className="restaurant-table-info">
                        <img src={TableIcon} alt="Table" />
                        {getTableName()}
                    </p>
                )}
            </header>

            <div className={`search-menu-wrapper ${isSearchSticked ? 'sticked' : ''}`}>
                <div className="search-input-container">
                    <input 
                        type="text" 
                        placeholder="Search for dishes, categories..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {/* Add search icon here if needed */}
                </div>
            </div>

            <main className="menu-content-area">
                {isSearchActive ? (
                    <FlatProductList products={filteredProductsForList} searchTerm={debouncedSearchTerm} />
                ) : (
                    currentRestaurantMenu && <MenuAccordion categories={currentRestaurantMenu} />
                )}
            </main>

            <div className="bottom-actions-container">

                {cartLength > 0 && (
                    <button 
                        className="view-cart-button" 
                        onClick={() => {
                            const path = tableNumber ? `/cart/${restaurantId}?table=${tableNumber}` : `/cart/${restaurantId}`;
                            navigate(path);
                        }}
                    >
                        <span className="cart-item-count">{cartLength} Item{cartLength > 1 ? 's' : ''}</span>
                        <span className="cart-text">View Cart</span>
                        <span className="cart-arrow">&rarr;</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Menu;

export {};
