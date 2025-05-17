// src/components/Header/Header.tsx
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './Header.scss'; // Assuming SCSS file exists in the same directory
import LaCarteLogo from '../../assets/icons/la_carte.png'; // Adjust path as needed
import { useUserStore } from '../../store/userStore'; // Adjust path as needed

// Example navigation links, adjust as needed
const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/explore', label: 'Explore' }, // Restaurants/Order page
  { path: '/about', label: 'About Us' },
  { path: '/contact', label: 'Contact' },
];

const Header: React.FC = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isAuthenticated, currentUser, signOutUser } = useUserStore(); // Get auth state and user

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsMobileMenuOpen(false); // Close mobile menu on navigation
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleProfileClick = () => {
        // Navigate to a profile page or open a profile dropdown
        // For admin users, this could navigate to an admin dashboard
        if (currentUser?.isAdmin && currentUser.restaurantId) {
            handleNavigate(`/admin/restaurant/${currentUser.restaurantId}/home`);
        } else {
            handleNavigate('/profile'); // General user profile page
        }
    };
    
    const handleSignOut = async () => {
        await signOutUser();
        handleNavigate('/'); // Navigate to home after sign out
    }

    return (
        <header className="Header">
            <div className="header-content">
                <div className="header-logo" onClick={() => handleNavigate('/')}>
                    <img src={LaCarteLogo} width={100} alt="La Carte Logo" />
                </div>
                <nav className="header-nav-desktop">
                    {navLinks.map(link => (
                        <div key={link.path} className="header-nav-link" onClick={() => handleNavigate(link.path)}>
                            {link.label}
                        </div>
                    ))}
                </nav>
                <div className="header-actions-desktop">
                    {isAuthenticated ? (
                        <>
                            <button className="header-action-btn profile-btn" onClick={handleProfileClick}>
                                Profile
                            </button>
                        </>
                    ) : (
                        <button className="header-action-btn" onClick={() => handleNavigate('/login')}>
                            Login
                        </button>
                    )}
                    {/* <button className="header-action-btn" onClick={() => handleNavigate('/cart')}>Cart</button> */}
                </div>
                <div className="header-mobile-menu-icon" onClick={toggleMobileMenu}>
                    &#9776; {/* Hamburger Icon */}
                </div>
            </div>
            {isMobileMenuOpen && (
                <nav className="header-nav-mobile">
                    {navLinks.map(link => (
                        <div key={link.path} className="header-nav-link-mobile" onClick={() => handleNavigate(link.path)}>
                            {link.label}
                        </div>
                    ))}
                    {isAuthenticated ? (
                        <>
                            <div className="header-nav-link-mobile" onClick={handleProfileClick}>Profile</div>
                        </>
                    ) : (
                        <div className="header-nav-link-mobile" onClick={() => handleNavigate('/login')}>Login</div>
                    )}
                    {/* <div className="header-nav-link-mobile" onClick={() => handleNavigate('/cart')}>Cart</div> */}
                </nav>
            )}
        </header>
    );
}

export default Header;
