import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './Header.scss'; // We'll create this SCSS file next
import LaCarteLogo from '../../assets/icons/la_carte.png'
// Example navigation links, adjust as needed
const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/menu', label: 'Menu' },
  { path: '/about', label: 'About Us' },
  { path: '/contact', label: 'Contact' },
];

const Header: React.FC = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsMobileMenuOpen(false); // Close mobile menu on navigation
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="Header">
            <div className="header-content">
                <div className="header-logo" onClick={() => handleNavigate('/')}>
                    <img src={LaCarteLogo} width={100} alt="la-carte-logo" />
                </div>
                <nav className="header-nav-desktop">
                    {navLinks.map(link => (
                        <div key={link.path} className="header-nav-link" onClick={() => handleNavigate(link.path)}>
                            {link.label}
                        </div>
                    ))}
                </nav>
                <div className="header-actions-desktop">
                    {/* Placeholder for desktop action buttons like Login/Cart */}
                    <button className="header-action-btn" onClick={() => handleNavigate('/login')}>Login</button>
                    <button className="header-action-btn" onClick={() => handleNavigate('/cart')}>Cart</button>
                </div>
                <div className="header-mobile-menu-icon" onClick={toggleMobileMenu}>
                    {/* Basic hamburger icon, consider using an SVG or icon library */}
                    &#9776;
                </div>
            </div>
            {isMobileMenuOpen && (
                <nav className="header-nav-mobile">
                    {navLinks.map(link => (
                        <div key={link.path} className="header-nav-link-mobile" onClick={() => handleNavigate(link.path)}>
                            {link.label}
                        </div>
                    ))}
                    <div className="header-nav-link-mobile" onClick={() => handleNavigate('/login')}>Login</div>
                    <div className="header-nav-link-mobile" onClick={() => handleNavigate('/cart')}>Cart</div>
                </nav>
            )}
        </header>
    );
}

export default Header;
