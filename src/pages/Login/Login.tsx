import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import firebaseInstance from '../../config/firebaseConfig'; // Your Firebase instance (default export from config)
import { useUserStore } from '../../store/userStore';
import Logo from '../../assets/icons/logo.png';
import './Login.scss';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const uiInstanceRef = useRef<firebaseui.auth.AuthUI | null>(null);
    const authContainerId = 'firebaseui-auth-container';

    const {
        setFirebaseUser: setFirebaseUserInStore,
        addUserDetails: addUserDetailsInStore,
    } = useUserStore();

    // Memoize the Firebase auth instance.
    // `firebaseInstance` is the default export from your firebaseConfig.js (the `firebase` namespace).
    // `firebaseInstance.auth()` returns the Firebase Auth service.
    // This service instance is a singleton if your firebaseConfig.js initializes Firebase correctly (which it appears to do).
    // The useMemo with an empty dependency array ensures this specific `auth` variable is stable for this component instance.
    // The multiple "Getting Firebase Auth instance for useMemo" logs indicate the Login component itself is remounting.
    const auth = useMemo(() => {
        console.log("Getting Firebase Auth service for useMemo (should happen per Login component mount).");
        return firebaseInstance.auth();
    }, []);

    const handleSignInFailure = useCallback((error: firebaseui.auth.AuthUIError) => {
        console.error('FirebaseUI Sign-In Error:', error);
        return Promise.resolve();
    }, []);

    const handleSignInSuccess = useCallback((authResult: any, redirectUrl?: string | null) => {
        console.log('FirebaseUI Sign-In Success:', authResult); // THIS IS THE CALLBACK NOT FIRING
        const firebaseUser = authResult.user;

        if (firebaseUser) {
            setFirebaseUserInStore(firebaseUser);
            console.log('Firebase user set in Zustand store.');

            if (authResult.additionalUserInfo?.isNewUser && firebaseUser.phoneNumber) {
                console.log('New user detected. Adding details to store/DB.');
                addUserDetailsInStore(firebaseUser.uid, firebaseUser.phoneNumber)
                    .then(() => console.log("New user details successfully added."))
                    .catch(err => console.error("Error adding new user details:", err));
            }
            console.log('Sign-in successful. Manual redirect or further actions can be handled here.');
            const from = (location.state as { from?: Location })?.from?.pathname || '/';
            navigate(from)
            // Example: navigate('/');
        } else {
            console.warn('Sign-in success callback, but no Firebase user found in authResult.');
        }
        return false; // Prevent FirebaseUI from redirecting.
    }, [setFirebaseUserInStore, addUserDetailsInStore, navigate]);

    const handleUiShown = useCallback(() => {
        console.log('FirebaseUI widget is now shown.');
        const loader = document.getElementById('firebaseui-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }, []);

    useEffect(() => {
        console.log('Login component main useEffect triggered (FirebaseUI setup).');

        let ui = firebaseui.auth.AuthUI.getInstance();
        if (!ui) {
            ui = new firebaseui.auth.AuthUI(auth); // 'auth' is the memoized Firebase Auth service
            console.log('Created a new FirebaseUI AuthUI instance.');
        } else {
            console.log('Reusing existing FirebaseUI AuthUI instance.');
        }
        uiInstanceRef.current = ui;

        const uiConfig: firebaseui.auth.Config = {
            signInFlow: 'popup',
            signInOptions: [
                {
                    provider: firebaseInstance.auth.PhoneAuthProvider.PROVIDER_ID,
                    recaptchaParameters: {
                        type: 'image',
                        size: 'normal',
                        badge: 'bottomleft'
                    },
                    defaultCountry: 'IN',
                }
            ],
            callbacks: {
                signInFailure: handleSignInFailure,
                signInSuccessWithAuthResult: handleSignInSuccess,
                uiShown: handleUiShown,
            },
        };

        const authContainer = document.getElementById(authContainerId);
        if (authContainer) {
            console.log('Attempting to start FirebaseUI widget.');
            ui.start(`#${authContainerId}`, uiConfig);
        } else {
            console.error(`FirebaseUI container with id '${authContainerId}' not found in the DOM (this should not happen if component is mounted).`);
        }

        return () => {
            console.log('Cleanup from main useEffect: Resetting FirebaseUI instance.');
            if (uiInstanceRef.current) {
                try {
                    uiInstanceRef.current.reset();
                } catch (error) {
                    console.error("Error resetting FirebaseUI during cleanup:", error);
                }
            }
        };
    }, [auth, handleSignInFailure, handleSignInSuccess, handleUiShown]); // Dependencies are stable.

    return (
        <div className="LoginPage">
            <div className="login-content-wrapper section-padding">
                <div className="login-logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src={Logo} alt="La Carte Logo" className="login-logo" />
                </div>
                <div className="login-card">
                    <h1 className="login-title">Sign In / Sign Up</h1>
                    <p className="login-subtitle">Access your La Carte account or create a new one.</p>
                    <div id={authContainerId}></div>
                    <div id="firebaseui-loader" className="firebaseui-loader" style={{ marginTop: '20px', textAlign: 'center' }}>Loading...</div>
                </div>
            </div>
        </div>
    );
}

export default Login;
// ```

// **Key Areas to Investigate (Outside of `Login.tsx`):**

// 1.  **`PublicRoute.tsx` Behavior:**
//     * This component controls whether `<Outlet />` (which renders your `Login` component) is displayed.
//     * It uses `isLoading` and `isAuthenticated` from `useUserStore`.
//     * **Problem Scenario:**
//         1.  User navigates to `/login`. `PublicRoute` initially might show "Verifying access..." if `isLoading` is true.
//         2.  `isLoading` becomes false, `isAuthenticated` is false. `PublicRoute` renders `<Outlet />`, so `Login` mounts and FirebaseUI starts.
//         3.  User interacts with FirebaseUI.
//         4.  The `signInSuccessWithAuthResult` callback (if it were to fire) would call `setFirebaseUserInStore(firebaseUser)`. This updates `isAuthenticated` (and potentially `isLoading`) in your Zustand store.
//         5.  If this state update causes `PublicRoute` to *temporarily* stop rendering `<Outlet />` (e.g., by showing the "Verifying access..." message again because `isLoading` flipped, or by starting the 10-second redirect countdown), the `Login` component will unmount.
//         6.  This unmount triggers the FirebaseUI reset *before* the popup can successfully call back.
//     * **Recommendation:** Ensure that once `Login` is rendered, `PublicRoute` doesn't unmount it due to transient changes in `isLoading` during an active sign-in attempt. The 10-second delay for `setShouldRedirect` in `PublicRoute` is also quite long and might interact unexpectedly.

// 2.  **`useUserStore` State Management:**
//     * Analyze how `isLoading` and `isAuthenticated` are set and updated by `initializeAuthListener` and especially by actions like `setFirebaseUserInStore`.
//     * Ensure that `setFirebaseUserInStore` (or other actions triggered around the login process) doesn't cause `isLoading` to toggle in a way that makes `PublicRoute` hide and then re-show the `Login` component.

// 3.  **React DevTools:**
//     * Use the **Profiler** in React DevTools to see exactly why and when `Login` (and `PublicRoute`) are re-rendering and, crucially, unmounting. This will give you a clear trace.

// The `Login.tsx` itself is mostly fine. The battle is to give it a stable environment (no unmounts) while the FirebaseUI popup is active. Once you stabilize the `Login` component's lifecycle by adjusting `PublicRoute.tsx` and/or your store logic, the callbacks should start firing correct