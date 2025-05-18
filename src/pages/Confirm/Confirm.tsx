// src/pages/Confirm/Confirm.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import './Confirm.scss'; // We'll create this SCSS file
import ConfirmIcon from '../../assets/icons/confirm.svg'; // Ensure this path is correct

const AUTO_REDIRECT_DELAY = 5000; // 5 seconds

const Confirm: React.FC = () => {
    const navigate = useNavigate();
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const [searchParams] = useSearchParams();
    const location = useLocation(); // To check if navigation has already occurred

    const [countdown, setCountdown] = useState<number>(AUTO_REDIRECT_DELAY / 1000);
    const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
    const hasNavigatedManuallyRef = useRef<boolean>(false);

    useEffect(() => {
        // Clear any existing timeout when dependencies change or component unmounts
        const clearExistingTimeout = () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = null;
            }
        };

        // Start the countdown and redirect timer
        const startTimers = () => {
            clearExistingTimeout(); // Clear previous before setting new
            
            // Countdown timer for display
            let currentCountdown = AUTO_REDIRECT_DELAY / 1000;
            setCountdown(currentCountdown);
            const intervalId = setInterval(() => {
                currentCountdown -= 1;
                setCountdown(currentCountdown);
                if (currentCountdown <= 0) {
                    clearInterval(intervalId);
                }
            }, 1000);

            // Auto-redirect timer
            timeoutIdRef.current = setTimeout(() => {
                if (!hasNavigatedManuallyRef.current) {
                    console.log("Auto-redirecting to My Orders...");
                    navigate('/my-orders'); // Navigate to user's general orders page
                }
            }, AUTO_REDIRECT_DELAY);

            return () => { // Cleanup for this effect iteration
                clearInterval(intervalId);
                clearExistingTimeout();
            };
        };
        
        const cleanupTimers = startTimers();

        return cleanupTimers; // This will be called on unmount or if dependencies change

    }, [navigate]); // Only run on mount and unmount

    // Listen to location changes to detect manual navigation
    useEffect(() => {
        // This effect runs after the initial render and on every location change.
        // If the location changes from the confirm page, it means user navigated.
        return () => {
            // This cleanup runs when the component is about to unmount,
            // or if the location changes (which also unmounts this specific instance of the page).
            if (location.pathname.startsWith(`/confirm/${restaurantId}`)) {
                // If still on a confirm page (e.g. params change but still confirm), don't mark as manual.
                // This case is unlikely for this specific page.
            } else {
                // If path is no longer the confirm page, user has navigated.
                hasNavigatedManuallyRef.current = true;
                if (timeoutIdRef.current) {
                    clearTimeout(timeoutIdRef.current);
                    console.log("Auto-redirect cancelled due to manual navigation.");
                }
            }
        };
    }, [location, restaurantId]);


    const handleNavigateToMenu = () => {
        hasNavigatedManuallyRef.current = true;
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        const tableParam = searchParams.get('table');
        navigate(restaurantId ? `/menu/${restaurantId}${tableParam ? `?table=${tableParam}` : ''}` : '/explore');
    };

    const handleNavigateToMyOrders = () => {
        hasNavigatedManuallyRef.current = true;
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        navigate('/my-orders');
    };

    return (
        <div className="ConfirmPage"> {/* Renamed class */}
            {/* Watermark applied via SCSS */}
            <div className="confirm-content-wrapper section-padding">
                <div className="confirm-icon-container">
                    <img src={ConfirmIcon} alt="Order Confirmed" className="confirm-icon" />
                </div>
                <h1 className="confirm-heading section-title">Order Confirmed!</h1>
                <p className="confirm-text">
                    Your order has been successfully placed and is being processed by the restaurant.
                </p>
                <p className="confirm-redirect-timer">
                    You will be redirected to "My Orders" in {countdown} seconds...
                </p>

                <div className="confirm-actions">
                    <button className="cta-button secondary" onClick={handleNavigateToMenu}>
                        Explore More
                    </button>
                    <button className="cta-button primary" onClick={handleNavigateToMyOrders}>
                        View My Orders
                    </button>
                </div>
            </div>
            {/* <Footer /> */} {/* Footer is typically in App.tsx for global layout */}
        </div>
    );
};

export default Confirm;

// Ensures file is treated as a module
export {};
