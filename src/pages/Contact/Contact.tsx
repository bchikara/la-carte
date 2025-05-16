import React from 'react';
// import Header from '../header/header'; // Uncomment if you have a Header component for this page
import './Contact.scss';

// It's good practice to have Font Awesome properly set up in your project (e.g., via CDN or npm package)
// For this example, we're assuming the 'fas' classes are available globally.

const Contact: React.FC = () => {
    return (
        <>
            {/* <Header /> */} {/* Uncomment if a Header is used on this page */}
            <div className="ContactPage"> {/* Renamed class for clarity */}
                <div className="contact-content-wrapper section-padding"> {/* Added wrapper and section-padding */}
                    <h1 className="section-title">Contact Us</h1>
                    <p className="section-subtitle">
                        We'd love to hear from you! Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
                    </p>

                    <div className="contact-details-grid">
                        <div className="contact-detail-item">
                            <div className="contact-icon-wrapper">
                                <i className="fas fa-briefcase"></i>
                            </div>
                            <div className="contact-text-wrapper">
                                <h4>Business Name</h4>
                                <span>La Carte</span>
                            </div>
                        </div>

                        <div className="contact-detail-item">
                            <div className="contact-icon-wrapper">
                                <i className="fas fa-barcode"></i> {/* Changed to a more relevant icon for GSTIN */}
                            </div>
                            <div className="contact-text-wrapper">
                                <h4>GSTIN</h4>
                                <span>08BBWPN8094F1ZT</span>
                            </div>
                        </div>

                        <div className="contact-detail-item">
                            <div className="contact-icon-wrapper">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <div className="contact-text-wrapper">
                                <h4>Email Address</h4>
                                <a href="mailto:lacartethe@gmail.com">lacartethe@gmail.com</a>
                            </div>
                        </div>

                        <div className="contact-detail-item">
                            <div className="contact-icon-wrapper">
                                <i className="fas fa-phone"></i>
                            </div>
                            <div className="contact-text-wrapper">
                                <h4>Phone Numbers</h4>
                                <a href="tel:+917014202898">+91 7014202898</a>
                                <br />
                                <a href="tel:+918266849356">+91 8266849356</a>
                            </div>
                        </div>

                        <div className="contact-detail-item address-item"> {/* Spans two columns on desktop */}
                            <div className="contact-icon-wrapper">
                                <i className="fas fa-map-marker-alt"></i>
                            </div>
                            <div className="contact-text-wrapper">
                                <h4>Office Address</h4>
                                <span>
                                    F-53, <br />
                                    Samrat Prithviraj Chauhan Marg, <br />
                                    Chandarwardai Nagar, Ajmer, <br />
                                    Rajasthan, 305001, India
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Contact;
export {}
