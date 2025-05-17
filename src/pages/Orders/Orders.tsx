// src/pages/UserOrders/UserOrders.tsx
import React, { useEffect, useState, useMemo } from 'react';
import Moment from 'react-moment'; // Ensure 'react-moment' and 'moment' are installed
import { useNavigate } from 'react-router-dom';

import { useUserStore } from '../../store/userStore'; // Adjust path
import { useRestaurantStore } from '../../store/restaurantStore';
import { Order, OrderProduct } from '../../types/user.types'; // Adjust path

// Assuming icons are in an 'icons' subdirectory of 'assets'
import VegIcon from '../../assets/icons/veg.svg';
import NonVegIcon from '../../assets/icons/non-veg.svg';
import InvoiceGeneratorButton from '../../components/Invoice/Invoice'; // Import new component

import './Orders.scss'; // Ensure this SCSS file exists and is named correctly

// Debounce hook (consider moving to a shared utils/hooks folder)
const useDebounce = (value: string, delay: number): string => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

// Dummy order data for testing
const DUMMY_ORDER: Order = {
    key: "DUMMY_ORDER_123",
    orderId: "DUMMY_ORDER_123",
    products: {
        "prod1": { productId: "prod1", name: "Paneer Butter Masala", quantity: 2, price: 250, veg: true },
        "prod2": { productId: "prod2", name: "Garlic Naan", quantity: 4, price: 50, veg: true },
        "prod3": { productId: "prod3", name: "Coke (500ml)", quantity: 1, price: 60 }
    },
    time: Date.now() - (24 * 60 * 60 * 1000), // Yesterday
    totalAmount: (2*250) + (4*50) + 60, // Should match totalPrice
    totalPrice: (2*250) + (4*50) + 60,
    orderDate: new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString(),
    status: 'delivered',
    restaurantId: "dummyRestaurantId123",
    restaurantName: "Test Restaurant Deluxe",
    table: "Takeaway",
    paymentId: "PAY_DUMMY_12345",
    paymentStatus: "captured",
};


const UserOrders: React.FC = () => {
    const navigate = useNavigate();
    const { 
        currentUser, // Needed for InvoiceGeneratorButton
        userOrders, 
        isLoadingUserOrders, 
        errorUserOrders,
    } = useUserStore();

    const { restaurantsList, listenToAllRestaurants, stopListeningToAllRestaurants } = useRestaurantStore();

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // State to hold orders to display (either from store or dummy)
    const [ordersToDisplay, setOrdersToDisplay] = useState<Order[]>([]);

    useEffect(() => {
        // Fetch all restaurants to get details for invoices if not already loaded
        // This could be optimized if restaurant details are already part of the order object
        if (restaurantsList.length === 0) {
            listenToAllRestaurants();
        }
        return () => {
            stopListeningToAllRestaurants();
        };
    }, [listenToAllRestaurants, stopListeningToAllRestaurants, restaurantsList.length]);

    useEffect(() => {
        if (!isLoadingUserOrders && userOrders.length === 0 && !errorUserOrders) {
            // If no actual orders and not loading, show the dummy order for testing
            setOrdersToDisplay([DUMMY_ORDER]);
        } else {
            setOrdersToDisplay(userOrders);
        }
    }, [userOrders, isLoadingUserOrders, errorUserOrders]);


    const filteredOrders = useMemo(() => {
        if (!debouncedSearchTerm) {
            return ordersToDisplay;
        }
        const lowerSearchTerm = debouncedSearchTerm.toLowerCase();
        return ordersToDisplay.filter(order => 
            order.key.toLowerCase().includes(lowerSearchTerm) ||
            order.restaurantName?.toLowerCase().includes(lowerSearchTerm) ||
            Object.values(order.products).some(
                (product: OrderProduct) => product.name.toLowerCase().includes(lowerSearchTerm)
            )
        );
    }, [ordersToDisplay, debouncedSearchTerm]);

    const getRestaurantForOrder = (restaurantId: string) => {
        // If using the dummy order, provide dummy restaurant details
        if (restaurantId === "dummyRestaurantId123") {
            return {
                id: "dummyRestaurantId123",
                name: "Test Restaurant Deluxe",
                address: "123 Test Street, Food City",
                phone: "9876543210",
                // Add other necessary Restaurant fields if your InvoiceGeneratorButton expects them
            } as any; // Cast to any or a partial Restaurant type for dummy data
        }
        return restaurantsList.find(r => r.id === restaurantId) || null;
    };


    if (isLoadingUserOrders && userOrders.length === 0 && ordersToDisplay.length === 0) { 
        return <div className="orders-loading-state">Loading your orders...</div>;
    }

    // Don't show error if we are displaying dummy data
    if (errorUserOrders && ordersToDisplay.length === 0 && !userOrders.some(o => o.key === DUMMY_ORDER.key) ) {
        return <div className="orders-error-state">Error loading orders: {errorUserOrders}</div>;
    }
    

    return (
        <div className="UserOrdersPage">
            <header className="user-orders-header section-padding">
                <h1 className="section-title">Your Order History</h1>
                <div className="order-search-filter">
                    <input 
                        type="text" 
                        placeholder="Search by Order ID, Restaurant, or Item..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <main className="user-orders-content section-padding">
                {filteredOrders.length > 0 ? (
                    <div className="orders-list-container">
                        {filteredOrders.map((order) => {
                            const restaurantDetailsForInvoice = getRestaurantForOrder(order.restaurantId);
                            return (
                                <div className="order-card" key={order.key}>
                                    <div className="order-card-header">
                                        <div className="order-info">
                                            <span className="order-id-text">Order ID: #{order.key ? order.key.substring(0, 8) : 'N/A'}...</span>
                                            <span className={`order-status status-${order.status?.toLowerCase()}`}>{order.status || 'Unknown'}</span>
                                        </div>
                                        <div className="order-meta">
                                            <span className="order-restaurant">{order.restaurantName || restaurantDetailsForInvoice?.name || 'Restaurant'}</span>
                                            <span className="order-date">
                                                <Moment format="MMM DD, YYYY - hh:mm A">{new Date(order.time)}</Moment>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="order-products-summary">
                                        {Object.values(order.products).slice(0, 2).map((product: OrderProduct, index) => (
                                            <div className="summary-product-item" key={`${order.key}-prod-${index}`}>
                                                <div className="product-name-icon">
                                                    <img 
                                                        src={product.veg === true || product.veg === 'true' ? VegIcon : NonVegIcon} 
                                                        alt={product.veg ? "Veg" : "Non-Veg"} 
                                                        className="product-veg-indicator"
                                                    />
                                                    <span>{product.name} x {product.quantity}</span>
                                                </div>
                                                <span>₹{(product.price * product.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                        {Object.keys(order.products).length > 2 && (
                                            <div className="summary-more-items">
                                                + {Object.keys(order.products).length - 2} more item(s)
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="order-card-footer">
                                        <div className="footer-left">
                                            <span className="order-total-label">Total Paid:</span>
                                            <span className="order-total-amount">₹{order.totalPrice ? order.totalPrice.toFixed(2) : 'N/A'}</span>
                                        </div>
                                        <div className="footer-right">
                                            <InvoiceGeneratorButton 
                                                order={order} 
                                                restaurant={restaurantDetailsForInvoice} 
                                                user={currentUser} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="no-orders-message">
                        <p>{debouncedSearchTerm ? "No orders found matching your search." : "You haven't placed any orders yet. (Showing a sample order for PDF testing if this is the only one)."}</p>
                        {!debouncedSearchTerm && !userOrders.length && (
                             <p style={{fontSize: '0.8rem', color: '#777'}}>This is a sample order card for testing purposes.</p>
                        )}
                        <button className="cta-button primary" onClick={() => navigate('/explore')}>
                            Start Ordering
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserOrders;

export {};
