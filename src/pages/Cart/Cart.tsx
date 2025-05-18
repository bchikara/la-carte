// src/pages/Cart/Cart.tsx
import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useCartStore } from '../../store/cartStore';        
import { useRestaurantStore } from '../../store/restaurantStore'; 
import { useUserStore } from '../../store/userStore';      
import { usePaymentStore } from '../../store/paymentStore'; // New Payment Store
import { CartItem } from '../../types/cart.types';          
import DeleteIcon from '../../assets/icons/delete.svg';         

import './Cart.scss';

const Cart: React.FC = () => {
    const navigate = useNavigate();
    const { id: restaurantId } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();

    const { 
        cart, 
        totalItems,
        addToCart: addToCartStore, 
        removeFromCart: removeFromCartStore, 
        deleteCartItem: deleteCartItemStore,
        getCartTotalAmount,
        initializeCart,
        isCartInitialized
    } = useCartStore();

    const { 
        currentRestaurant, 
        listenToRestaurantAndMenu, 
        stopListeningToRestaurantDetails 
    } = useRestaurantStore();

    const { currentUser, firebaseUser } = useUserStore();
    
    const {
        isProcessingPayment,
        paymentError,
        paymentSuccessData,
        redirectToConfirmationPath,
        initiatePaymentAndCheckout,
        clearPaymentStatus,
        setRedirectToConfirmationPath
    } = usePaymentStore();


    const cartList = useMemo(() => Object.values(cart), [cart]);
    const cartTotalAmount = useMemo(() => getCartTotalAmount(), [cart, getCartTotalAmount]);

    useEffect(() => {
        if (!isCartInitialized) {
            initializeCart();
        }
    }, [isCartInitialized, initializeCart]);
    
    useEffect(() => {
        window.scrollTo(0, 0);
        if (restaurantId) {
            listenToRestaurantAndMenu(restaurantId); 
        }
        return () => {
            if (restaurantId) {
                stopListeningToRestaurantDetails();
            }
        };
    }, [restaurantId, listenToRestaurantAndMenu, stopListeningToRestaurantDetails]);

    // Effect to handle navigation after successful order placement
    useEffect(() => {
        if (redirectToConfirmationPath) {
            navigate(redirectToConfirmationPath);
            setRedirectToConfirmationPath(null); // Reset after navigation
        }
    }, [redirectToConfirmationPath, navigate, setRedirectToConfirmationPath]);

    // Effect to clear payment status when component unmounts or restaurantId changes
    useEffect(() => {
        return () => {
            clearPaymentStatus();
        };
    }, [clearPaymentStatus, restaurantId]);


    const handleQuantityChange = (item: CartItem, type: 'add' | 'remove') => {
        const productDataForStore = { 
            key: item.productKey, 
            name: item.name, 
            price: item.price, 
            icon: item.icon,
        };
        if (type === 'add') {
            addToCartStore(productDataForStore as any); 
        } else {
            removeFromCartStore(item.productKey);
        }
    };

    const handleDeleteFromCart = (productKey: string) => {
        deleteCartItemStore(productKey);
    };

    const calculatedGST = useMemo(() => {
        return currentRestaurant?.registered ? cartTotalAmount * 0.05 : 0;
    }, [cartTotalAmount, currentRestaurant?.registered]);

    const finalOrderAmount = useMemo(() => {
        return parseFloat((cartTotalAmount + calculatedGST).toFixed(2));
    }, [cartTotalAmount, calculatedGST]);

    const handleProceedToPayment = async () => {
        if (finalOrderAmount <= 0) {
            alert('Your cart is empty or the total amount is zero.');
            return;
        }
        if (!currentUser || !firebaseUser?.phoneNumber || !restaurantId) {
            console.log(currentUser,firebaseUser,restaurantId)
            alert('User or restaurant information is missing. Please ensure you are logged in.');
            return;
        }

        const paymentPayload = {
            amount: finalOrderAmount, // Amount should be in smallest currency unit if backend expects (e.g. paise)
                                      // If your backend takes rupees, this is fine. Otherwise, multiply by 100.
            currency: 'INR' as 'INR',
            metadata: {
                email_id: currentUser.email || `${firebaseUser.phoneNumber}@lacarte.com`,
                contact_number: firebaseUser.phoneNumber,
                order_details: `Order from ${currentRestaurant?.name || 'La Carte'}`,
            },
            // receipt: `order_rcptid_${Date.now()}` // Example receipt for Razorpay
        };

        const orderPlacementDetails = {
            restaurantId: restaurantId,
            tableId: searchParams.get('table'),
        };

        await initiatePaymentAndCheckout(paymentPayload, orderPlacementDetails);
    };


    return (
        <div className="CartPage">
            <header className="cart-page-header section-padding">
                <h1 className="section-title">Your Order Summary</h1>
                {currentRestaurant && <p className="cart-restaurant-name">From: {currentRestaurant.name}</p>}
            </header>

            <main className="cart-content-wrapper section-padding">
                {paymentError && <div className="payment-error-message">Error: {paymentError}</div>}
                {cartList.length > 0 ? (
                    <div className="cart-items-list">
                        {cartList.map((item) => (
                            <div className="cart-item-card" key={item.productKey}>
                                <div className="item-info">
                                    <h3 className="item-name">{item.name}</h3>
                                    <p className="item-price">₹{item.price.toFixed(2)}</p>
                                </div>
                                <div className="item-actions">
                                    <div className="quantity-control">
                                        <button onClick={() => handleQuantityChange(item, 'remove')} aria-label="Decrease quantity">-</button>
                                        <span className="item-quantity">{item.quantity}</span>
                                        <button onClick={() => handleQuantityChange(item, 'add')} aria-label="Increase quantity">+</button>
                                    </div>
                                    <button onClick={() => handleDeleteFromCart(item.productKey)} className="item-delete-button" aria-label="Delete item">
                                        <img src={DeleteIcon} alt="Delete" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-cart-message">
                        <p>Your cart is currently empty.</p>
                        <button 
                            className="cta-button primary" 
                            onClick={() => navigate(restaurantId ? `/menu/${restaurantId}${searchParams.get('table') ? `?table=${searchParams.get('table')}`: ''}` : '/explore')}
                        >
                            Back to Menu
                        </button>
                    </div>
                )}

                {cartList.length > 0 && (
                    <section className="order-summary-section">
                        <h2 className="summary-title">Bill Details</h2>
                        <div className="summary-item">
                            <p>Subtotal</p>
                            <span>₹{cartTotalAmount.toFixed(2)}</span>
                        </div>
                        {currentRestaurant?.registered && (
                            <>
                                <div className="summary-item">
                                    <p>SGST (2.5%)</p>
                                    <span>₹{(cartTotalAmount * 0.025).toFixed(2)}</span>
                                </div>
                                <div className="summary-item">
                                    <p>CGST (2.5%)</p>
                                    <span>₹{(cartTotalAmount * 0.025).toFixed(2)}</span>
                                </div>
                            </>
                        )}
                        <div className="summary-item total">
                            <p>Grand Total</p>
                            <span>₹{finalOrderAmount.toFixed(2)}</span>
                        </div>
                        <button 
                            className="cta-button primary large place-order-button" 
                            onClick={handleProceedToPayment}
                            disabled={isProcessingPayment}
                        >
                            {isProcessingPayment ? 'Processing Payment...' : 'Proceed to Payment'}
                        </button>
                    </section>
                )}
            </main>
        </div>
    );
}

export default Cart;

export {};
