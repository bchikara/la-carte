import React from 'react';
import { useNavigate } from 'react-router-dom';

import './Home.scss'; // We will significantly update this SCSS
import Logo from '../../assets/icons/la_carte.png'; // Your main logo
import foodLogo from '../../assets/icons/food-logo.png'; // Your food-specific logo

// Placeholder images - replace with your actual Unsplash/relevant images
import BannerImage from '../../assets/icons/logo.png';
import LocationIcon from '../../assets/icons/location_home.png';
import OrderIcon from '../../assets/icons/order.png';
import PayIcon from '../../assets/icons/pay.png';
import MealsIcon from '../../assets/icons/meals.png';
import Feature1Image from '../../assets/icons/Feature 1.png';
import Feature2Image from '../../assets/icons/Feature 2.png';
import DownArrow from '../../assets/icons/down-arrow.svg';

const howItWorksCustomerImg = "https://placehold.co/400x300/ffbc36/333333?text=Customer+Orders";
const howItWorksRestaurantImg = "https://placehold.co/400x300/e08f00/FFFFFF?text=Restaurant+Manages";
const testimonialUserImage1 = "https://placehold.co/80x80/cccccc/FFFFFF?text=User1";
const testimonialUserImage2 = "https://placehold.co/80x80/cccccc/FFFFFF?text=User2";


const videoUrl = "https://b.zmtcdn.com/data/file_assets/2627bbed9d6c068e50d2aadcca11ddbb1743095810.mp4";

const Landingpage: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <>
            {/* The Header is part of the full-height banner */}
            <div className="Home">
                {/* Section 1: Full Viewport Hero Banner with Video Background */}
                <section className="hero-banner-section">
                    <video className="hero-video-background" autoPlay muted loop playsInline poster="https://placehold.co/1920x1080/333333/FFFFFF?text=">
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                    <div className="hero-overlay"></div> {/* For text readability */}
                    <div className="hero-content">
                        <img src={Logo} alt="La Carte Logo" className="hero-logo" />
                        <h1 className="hero-main-title">Experience La Carte</h1>
                        <p className="hero-main-subtitle">
                            Seamless Restaurant Management. Delightful Food Ordering.
                        </p>
                        <div className="hero-cta-buttons">
                            <button className="cta-button primary" onClick={() => handleNavigation('/order')}>Order Food Now</button>
                            <button className="cta-button secondary" onClick={() => handleNavigation('/business-info')}>Restaurant Login</button>
                        </div>
                    </div>
                </section>

                {/* Section 2: "What is La Carte?" - Your Core Offerings (Business & Food Cards) */}
                <section className="offerings-section section-padding">
                    <h2 className="section-title">Discover La Carte</h2>
                    <p className="section-subtitle">Your all-in-one platform for dining and restaurant operations.</p>
                    <div className="offerings-cards-container">
                        <div className="offering-card">
                            <img src={Logo} alt="La Carte Business Solutions" className="offering-card-icon" />
                            <h3 className="offering-card-title">For Your Business</h3>
                            <p className="offering-card-description">
                                Streamline operations, manage menus, track orders, and grow your customer base with our powerful restaurant tools.
                            </p>
                            <button className="cta-button tertiary" onClick={() => handleNavigation('/business-info')}>Explore Business Tools</button>
                        </div>
                        <div className="offering-card">
                            <img src={foodLogo} alt="La Carte Food Ordering" className="offering-card-icon" />
                            <h3 className="offering-card-title">For Food Lovers</h3>
                            <p className="offering-card-description">
                                Find your favorite local restaurants, discover new cuisines, and enjoy hassle-free online ordering and delivery.
                            </p>
                            <button className="cta-button tertiary" onClick={() => handleNavigation('/order')}>Find Restaurants</button>
                        </div>
                    </div>
                </section>

                {/* Section 3: How It Works */}
                <section className="how-it-works-section section-padding">
                    <h2 className="section-title">Simple Steps to Get Started</h2>
                    <div className="how-it-works-container">
                        <div className="how-it-works-column">
                            <img src={BannerImage} alt="Customer ordering food" className="how-it-works-image"/>
                            <h3>For Customers</h3>
                            <ol>
                                <li><span>1.</span> Discover amazing local restaurants.</li>
                                <li><span>2.</span> Browse menus and place your order.</li>
                                <li><span>3.</span> Track your food and enjoy!</li>
                            </ol>
                        </div>
                        <div className="how-it-works-column">
                             <img src={BannerImage} alt="Restaurant managing orders" className="how-it-works-image"/>
                            <h3>For Restaurants</h3>
                            <ol>
                                <li><span>1.</span> Sign up and set up your profile.</li>
                                <li><span>2.</span> Easily manage your menu & orders.</li>
                                <li><span>3.</span> Grow your business with us!</li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* Section 4: Feature Highlights (Inspired by "What's waiting for you on the app?") */}
                <section className="features-section section-padding slanted-background">
                    <h2 className="section-title light-text">Why Choose La Carte?</h2>
                    <p className="section-subtitle light-text">Packed with features to enhance your experience.</p>
                    <div className="features-grid">
                        <div className="feature-item">
                            <img src={MealsIcon} alt="Easy Menu Management Icon" className="feature-icon" />
                            <h4>Intuitive Menu Management</h4>
                            <p>Easily create, update, and showcase your delicious offerings.</p>
                        </div>
                        <div className="feature-item">
                            <img src={OrderIcon} alt="Seamless Ordering Icon" className="feature-icon" />
                            <h4>Seamless Ordering</h4>
                            <p>A smooth and quick process for customers to order their favorite meals.</p>
                        </div>
                        <div className="feature-item">
                            <img src={LocationIcon} alt="Real-time Tracking Icon" className="feature-icon" />
                            <h4>Real-Time Tracking</h4>
                            <p>Keep customers informed and manage deliveries efficiently.</p>
                        </div>
                        <div className="feature-item">
                            <img src={PayIcon} alt="Analytics & Reports Icon" className="feature-icon" />
                            <h4>Powerful Analytics</h4>
                            <p>Gain insights into your sales, customer preferences, and performance.</p>
                        </div>
                    </div>
                    <button className="cta-button primary features-cta" onClick={() => handleNavigation('/features')}>Discover All Features</button>
                </section>

                {/* Section 5: Our Impact / Statistics */}
                <section className="impact-section section-padding">
                    <h2 className="section-title">Our Growing Community</h2>
                    <div className="impact-stats-container">
                        <div className="stat-item">
                            <span className="stat-number">500+</span>
                            <span className="stat-label">Partner Restaurants</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">10K+</span>
                            <span className="stat-label">Happy Customers</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">50K+</span>
                            <span className="stat-label">Orders Delivered</span>
                        </div>
                         <div className="stat-item">
                            <span className="stat-number">20+</span>
                            <span className="stat-label">Cities Served</span>
                        </div>
                    </div>
                </section>

                {/* Section 6: Testimonials (Placeholder) */}
                <section className="testimonials-section section-padding slanted-background-alt">
                    <h2 className="section-title light-text">What Our Users Say</h2>
                    <div className="testimonials-container">
                        <div className="testimonial-item">
                            <img src={testimonialUserImage1} alt="Testimonial User 1" className="testimonial-image"/>
                            <p className="testimonial-quote">"La Carte has transformed how we manage our orders. It's so easy to use!"</p>
                            <p className="testimonial-author">- Restaurant Owner, Food Haven</p>
                        </div>
                        <div className="testimonial-item">
                            <img src={testimonialUserImage2} alt="Testimonial User 2" className="testimonial-image"/>
                            <p className="testimonial-quote">"Ordering food is a breeze with La Carte. Love the variety and quick delivery!"</p>
                            <p className="testimonial-author">- Sarah L., Happy Customer</p>
                        </div>
                        {/* Add more testimonials as needed */}
                    </div>
                </section>

                {/* Section 7: Image Showcase / How it Works (Placeholder) - Kept from previous version */}
                <section className="showcase-section section-padding">
                    <h2 className="section-title">See La Carte in Action</h2>
                    <p className="section-subtitle">A visual glimpse into our platform.</p>
                    <div className="showcase-image-container">
                        <img src={Feature1Image} alt="La Carte Platform Showcase" className="showcase-image" />
                        <img src={Feature2Image} alt="La Carte Platform Showcase" className="showcase-image" />
                    </div>
                </section>

                {/* Section 8: Call to Action / App Download - Kept from previous version */}
                <section className="app-cta-section section-padding dark-background">
                    <div className="app-cta-content">
                        <div className="app-cta-text">
                            <h2 className="section-title">Get Started with La Carte</h2>
                            <p className="section-subtitle">
                                Join our growing community of restaurants and food enthusiasts.
                                Download our app or sign up today!
                            </p>
                        </div>
                        <div className="app-cta-buttons">
                            <button className="cta-button primary large" onClick={() => handleNavigation('/download-app')}>Download App</button>
                            <button className="cta-button secondary large" onClick={() => handleNavigation('/signup-vendor')}>Partner With Us</button>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Landingpage;
