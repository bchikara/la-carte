import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css'; // Standard FirebaseUI CSS

import firebaseInstance from '../../config/firebaseConfig'; // Your initialized Firebase app instance
import { useUserStore } from '../../store/userStore'; // Import your Zustand user store

import Logo from '../../assets/icons/logo.png';
import './Login.scss';

const Login: React.FC = () => {
    const navigate = useNavigate(); // Still needed for logo click
    const location = useLocation();
    const uiInstanceRef = useRef<firebaseui.auth.AuthUI | null>(null);
    const authContainerId = 'firebaseui-auth-container'; 

    const { 
        setFirebaseUser: setFirebaseUserInStore, 
        addUserDetails: addUserDetailsInStore,
    } = useUserStore();

    useEffect(() => {

    console.log('hello from login')
        let ui = firebaseui.auth.AuthUI.getInstance();
        if (!ui) {
            ui = new firebaseui.auth.AuthUI(firebaseInstance.auth());
        }
        uiInstanceRef.current = ui;

        const uiConfig: firebaseui.auth.Config = {
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
            signInFlow: 'popup',
            callbacks: {
                signInSuccessWithAuthResult: function(authResult: any, redirectUrl?: string) {
                    const firebaseUser = authResult.user;
                    console.log('hello',authResult)
                    if (firebaseUser) {
                        // 1. Update the Zustand store. This will change isAuthenticated.
                        setFirebaseUserInStore(firebaseUser);

                        const userPhoneNumber = firebaseUser.phoneNumber;
                        console.log('auth result',authResult,authResult.additionalUserInfo,authResult.additionalUserInfo.isNewUser)
                        if (authResult.additionalUserInfo?.isNewUser && userPhoneNumber) {
                            addUserDetailsInStore(firebaseUser.uid, userPhoneNumber)
                                .then(() => console.log("New user details submission initiated via store action"))
                                .catch(err => console.error("Error initiating new user details addition via store action:", err));
                        }

                        // 2. NO EXPLICIT NAVIGATION HERE.
                        // The PublicRoute component (wrapping /login) will detect the change
                        // in isAuthenticated state and handle the redirection to 
                        // location.state.from.pathname (if available) or to '/'.
                        console.log("Login successful. Auth state updated. Route guards will handle navigation.");
                    }
                    return false; // Important: Prevent FirebaseUI from redirecting.
                },
                uiShown: function() {
                    const loader = document.getElementById('firebaseui-loader');
                    if (loader) {
                        loader.style.display = 'none';
                    }
                }
            },
            // tosUrl: '/terms-of-service', 
            // privacyPolicyUrl: '/privacy-policy' 
        };

        const authContainer = document.getElementById(authContainerId);
        if (authContainer && uiInstanceRef.current) {
            // Check if there's a pending redirect operation.
            if (uiInstanceRef.current.isPendingRedirect()) {
                 uiInstanceRef.current.start(`#${authContainerId}`, uiConfig);
            } else if (!authContainer.hasChildNodes()) { 
                // Start the UI only if the container is empty to prevent multiple instances.
                 uiInstanceRef.current.start(`#${authContainerId}`, uiConfig);
            }
        } else if (!authContainer) {
            console.error(`FirebaseUI container #${authContainerId} not found.`);
        }

        return () => {
            if (uiInstanceRef.current) {
                try {
                    uiInstanceRef.current.reset();
                } catch (error) {
                    console.error("Error resetting FirebaseUI instance:", error);
                }
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount and cleanup on unmount. Store actions are stable.

    return (
        <div className="LoginPage">
            <div className="login-content-wrapper section-padding">
                <div className="login-logo-container" onClick={() => navigate('/')}>
                    <img src={Logo} alt="La Carte Logo" className="login-logo" />
                </div>

                <div className="login-card">
                    <h1 className="login-title">Sign In / Sign Up</h1>
                    <p className="login-subtitle">Access your La Carte account or create a new one.</p>
                    
                    <div id={authContainerId}></div> {/* Container for FirebaseUI */}
                    <div id="firebaseui-loader" className="firebaseui-loader">Loading...</div> 
                </div>
            </div>
        </div>
    );
}

export default Login;

export {};
