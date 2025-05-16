// src/pages/BusinessSite/BusinessSite.tsx

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BusinessSite.scss'; // Styles for this page

import BannerImage from '../../assets/icons/logo.png';
import LocationIcon from '../../assets/icons/location_home.png';
import OrderIcon from '../../assets/icons/order.png';
import PayIcon from '../../assets/icons/pay.png';
import MealsIcon from '../../assets/icons/meals.png';
import Feature1Image from '../../assets/icons/Feature 1.png';
import Feature2Image from '../../assets/icons/Feature 2.png';
import DownArrow from '../../assets/icons/down-arrow.svg';

import { useEarlyAccessStore } from '../../store/earlyAccessStore'; // Adjust path

function BusinessSite() {
    const navigate = useNavigate();
    const {
        formState,
        updateFormField,
        handleFormSubmit,
        isSubmitting,
        resetForm
    } = useEarlyAccessStore();

    // Accordion state
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target as { name: keyof typeof formState, value: string };
        updateFormField(name, value);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            updateFormField('files', e.target.files);
        }
    };

    const onSubmitForm = async (e: FormEvent) => {
        e.preventDefault();
        const success = await handleFormSubmit();
        if (success) {
            // Form was reset by the store action on success
            // Optionally navigate or do something else
        }
    };

    // Reset form on component unmount or if needed
    useEffect(() => {
        return () => {
            // resetForm(); // Uncomment if you want form to reset when navigating away
        };
    }, [resetForm]);


    const faqItems = [
        { question: "What is LaCarte engage and how does it work?", answer: "La Carte Engage is a re-marketing app to reach, engage and grow your business with incremental visits from your customers. You can sign-up, add a customer database choose prescribed campaigns and start distribution via SMS, email & Whatsapp. It’s the simple and fastest way to take your restaurant marketing functions to next level." },
        { question: "What are the main benefits of using LaCarte Engage ?", answer: "Restaurant Re-marketing on autopilot. Drive incremental visits. Brand Re-call for customers. Build guest data & segmentation to sell more." },
        { question: "How can I sign up?", answer: "Fill up the demo request form. Our team will get in touch with you within 24Hrs for signup and assist further." },
        { question: "How does your pricing work?", answer: "We offer commission based plans, the commission can vary between 1-8%. You will be only charged when the sale is through our application." },
        { question: "Does LaCarte provide guests' insights ?", answer: "Yes, with LaCarte you’ll receive all of the customer data to drive your business and marketing strategy." },
        { question: "Documents required to sign up to LaCarte", answer: "Complete details of the restaurant/Cafe, GST Certificate, FSSAI license." }
    ];


    return (
        <>
            <div className="business-site-page">

                {/* Section 1: Banner */}
                <section className="business-banner-section section-padding">
                    <div className="business-banner-content-wrapper">
                        <div className="business-banner-text">
                            <h1 className="section-title light-text">Power Up Your Restaurant</h1>
                            <p className="section-subtitle light-text">Join La Carte and connect with more customers, streamline your operations, and watch your business grow.</p>
                            <button className="cta-button primary large" onClick={() => document.getElementById('earlyAccessForm')?.scrollIntoView({ behavior: 'smooth' })}>
                                Get Early Access
                            </button>
                        </div>
                        <div className="business-banner-image-container">
                            <img src={BannerImage} alt="La Carte for Businesses" className="business-banner-image" />
                        </div>
                    </div>
                </section>

                {/* Section 2: How It Works */}
                <section className="business-how-it-works-section section-padding">
                    <h2 className="section-title">Simple Steps to Success</h2>
                    <p className="section-subtitle">Getting started with La Carte is easy. Here’s how it works for your restaurant:</p>
                    <div className="business-work-cards-container">
                        <div className="work-card">
                            <img src={LocationIcon} alt="Sign Up" className="work-card-icon" />
                            <h4>1. Sign Up & Setup</h4>
                            <p>Create your restaurant profile and easily add your menu details.</p>
                        </div>
                        <div className="work-card">
                            <img src={OrderIcon} alt="Receive Orders" className="work-card-icon" />
                            <h4>2. Receive Orders</h4>
                            <p>Get notified instantly for new orders through our intuitive dashboard.</p>
                        </div>
                        <div className="work-card">
                            <img src={PayIcon} alt="Manage Operations" className="work-card-icon" />
                            <h4>3. Manage & Grow</h4>
                            <p>Track performance, manage deliveries, and engage with customers.</p>
                        </div>
                        <div className="work-card">
                            <img src={MealsIcon} alt="Delight Customers" className="work-card-icon" />
                            <h4>4. Delight Customers</h4>
                            <p>Provide excellent service and delicious food to build loyalty.</p>
                        </div>
                    </div>
                </section>

                {/* Section 3: Feature 1 */}
                <section className="business-feature-section alt-background section-padding">
                    <div className="feature-content-container">
                        <div className="feature-image-wrapper">
                            <img src={Feature1Image} alt="Customizable Scan App" />
                        </div>
                        <div className="feature-text-wrapper">
                            <h3 className="feature-title">Your Brand, Your App</h3>
                            <p>Convert all your guests into loyal customers with your own white-labelled Scan & Order app. Increase repeat visits and motivate them to spend more.</p>
                            <button className="cta-button tertiary" onClick={() => navigate('/features/scan-app')}>Explore Scan App</button>
                        </div>
                    </div>
                </section>

                {/* Section 4: Feature 2 */}
                <section className="business-feature-section section-padding">
                    <div className="feature-content-container reverse-layout">
                        <div className="feature-image-wrapper">
                            <img src={Feature2Image} alt="Customizable Takeaway App" />
                        </div>
                        <div className="feature-text-wrapper">
                            <h3 className="feature-title">Boost Your Takeaway Sales</h3>
                            <p>Launch a branded Takeaway app to capture more orders directly. Offer convenience and build a stronger connection with your local customers.</p>
                            <button className="cta-button tertiary" onClick={() => navigate('/features/takeaway-app')}>Explore Takeaway App</button>
                        </div>
                    </div>
                </section>

                {/* Section 5: Early Access Form */}
                <section id="earlyAccessForm" className="business-form-section section-padding">
                    <div className="form-content-wrapper">
                        <h2 className="section-title light-text">Get Early Access</h2>
                        <p className="section-subtitle light-text">Be among the first to revolutionize your restaurant with La Carte. Sign up now for exclusive benefits and free setup!</p>
                        <form className="early-access-form" onSubmit={onSubmitForm}>
                            <input value={formState.contactName} type="text" onChange={handleInputChange} name="contactName" placeholder="Your Full Name" required />
                            <input value={formState.restaurantName} type="text" onChange={handleInputChange} name="restaurantName" placeholder="Restaurant Name" required />
                            <input value={formState.phone} type="tel" onChange={handleInputChange} name="phone" placeholder="Contact Phone Number" required />
                            <input value={formState.email} type="email" onChange={handleInputChange} name="email" placeholder="Email Address" required />
                            <textarea value={formState.message || ''} onChange={handleInputChange} name="message" placeholder="Tell us a bit about your restaurant (optional)" rows={3}></textarea>
                            <label htmlFor="fileUpload" className="file-upload-label">
                                Upload Menus/Photos (Optional, Max 5 files)
                            </label>
                            <input id="fileUpload" type="file" multiple onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx" />
                            {formState.files && <p className="file-info">{formState.files.length} file(s) selected.</p>}
                            <button type="submit" className="cta-button primary large" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Request Early Access'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Section 6: FAQ */}
                <section className="business-faq-section section-padding">
                    <h2 className="section-title">Frequently Asked Questions</h2>
                    <div className="faq-accordion-container">
                        {faqItems.map((item, index) => (
                            <div className={`accordion-item ${activeIndex === index ? 'active' : ''}`} key={index}>
                                <button className="accordion-tab" onClick={() => toggleAccordion(index)} aria-expanded={activeIndex === index} aria-controls={`faq-content-${index}`}>
                                    {item.question}
                                    <img src={DownArrow} alt="Toggle FAQ" className="accordion-arrow" />
                                </button>
                                <div id={`faq-content-${index}`} className="accordion-content" role="region" aria-hidden={activeIndex !== index}>
                                    <p>{item.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}

export default BusinessSite;
