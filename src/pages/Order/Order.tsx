// src/pages/Homepage/Homepage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Order.scss';
import Logo from '../../assets/icons/logo.png';
import ScanIcon from '../../assets/icons/scan.png'; // Your existing ScanIcon
import RestaurantList from '../../components/RestaurantList/RestaurantList'; // Adjust path
import { FaShoppingBag, FaStar, FaCalendarAlt, FaCommentDots } from 'react-icons/fa';

const Order: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'scan' | 'takeaway'>('scan');

    const handleTabSwitch = (tab: 'scan' | 'takeaway') => {
        setActiveTab(tab);
    };

    return (
        <>
            <div className="homepage-container">
                <header className="homepage-header">
                    <img src={Logo} alt="La Carte Logo" className="homepage-logo" />
                    <h1 className="homepage-main-title">La Carte</h1>
                    <p className="homepage-main-subtitle">Your Digital Dining Companion & Restaurant Solution</p>
                </header>

                <div className="tabs-navigation-wrapper">
                    <div className="tabs-navigation">
                        <button
                            className={`tab-button ${activeTab === 'scan' ? 'active' : ''}`}
                            onClick={() => handleTabSwitch('scan')}
                            aria-pressed={activeTab === 'scan'}
                        >
                            <img src={ScanIcon} alt="Scan Icon" className="tab-button-img-icon" />
                            Scan at Table
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'takeaway' ? 'active' : ''}`}
                            onClick={() => handleTabSwitch('takeaway')}
                            aria-pressed={activeTab === 'takeaway'}
                        >
                            <FaShoppingBag className="tab-button-react-icon" />
                            Order Takeaway
                        </button>
                    </div>
                </div>

                <main className="tab-content-area">
                    {activeTab === 'scan' && (
                        <div className="scan-tab-content animated-tab">
                            <div className="scan-visual">
                                <img src={ScanIcon} alt="Scan QR Code Illustration" className="scan-tab-image" />
                                <div className="qr-code-placeholder">
                                    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="30" height="30" fill="#333"/>
                                        <rect x="70" width="30" height="30" fill="#333"/>
                                        <rect y="70" width="30" height="30" fill="#333"/>
                                        <rect x="40" y="40" width="20" height="20" fill="#333"/>
                                        <rect x="10" y="40" width="10" height="10" fill="#333"/>
                                        <rect x="40" y="10" width="10" height="10" fill="#333"/>
                                    </svg>
                                </div>
                            </div>
                            <h2 className="scan-tab-title">Dine-in Smartly</h2>
                            <p className="scan-tab-description">
                                Visiting a La Carte partner restaurant? Simply scan the QR code at your table
                                to view the menu, place your order, and pay seamlessly – all from your phone!
                            </p>
                            <button className="cta-button primary scan-now-button" onClick={() => navigate('/scanner')}>
                                Open Scanner
                            </button>
                        </div>
                    )}
                    {activeTab === 'takeaway' && (
                        <div className="takeaway-tab-content animated-tab">
                             <h2 className="takeaway-tab-title">Your Next Meal, Delivered or Ready for Pickup!</h2>
                             <p className="takeaway-tab-description">Browse local favorites, discover new tastes, and order with ease.</p>
                            <RestaurantList />
                        </div>
                    )}
                </main>
                
                <section className="app-features-promo section-padding desktop-only">
                    <h2 className="section-title">More with La Carte</h2>
                    <div className="promo-grid">
                        <div className="promo-item">
                            <div className="promo-icon">
                                <FaStar />
                            </div> 
                            <h3>Exclusive Deals</h3>
                            <p>Unlock special offers and discounts when you order through the app.</p>
                        </div>
                        <div className="promo-item">
                            <div className="promo-icon">
                                <FaCalendarAlt />
                            </div>
                            <h3>Easy Reservations</h3>
                            <p>Book tables at your favorite restaurants in just a few taps.</p>
                        </div>
                        <div className="promo-item">
                            <div className="promo-icon">
                                <FaCommentDots />
                            </div>
                            <h3>Rate & Review</h3>
                            <p>Share your dining experiences and help others discover great food.</p>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Order;

export {};
