import React from 'react';
// import Header from '../header/header'; // Uncomment if you have a Header component for this page
import './Refund.scss';

const Refund: React.FC = () => {
     return (
         <>
            {/* <Header /> */} {/* Uncomment if a Header is used on this page */}
            <div className="RefundPage"> {/* Renamed class for clarity and consistency */}
                <div className="refund-content-wrapper section-padding"> {/* Added wrapper and section-padding */}
                    {/* Watermark will be applied via SCSS pseudo-element to refund-content-wrapper */}
                    <div className="la-costa-fixed-watermark-placeholder"></div> {/* This can be removed if watermark is on wrapper */}

                    <header className="refund-header">
                        <h1 className="section-title">Cancellation and Refund Policy</h1>
                    </header>
                    
                    <article className="refund-article-content">
                        <p className="intro-paragraph">
                            Thank you for using LaCarte! We hope you enjoy the convenience of ordering your favorite meals from your table. However, if you need to cancel your order or request a refund, please review our policy below:
                        </p>
                        
                        <section>
                            <h2>Cancellation Policy</h2>
                            <ul>
                                <li>Orders can be cancelled anytime before they are confirmed by the restaurant.</li>
                                <li>If an order is cancelled after it has been confirmed by the restaurant, the cancellation will not be accepted.</li>
                                <li>In case of a cancellation due to any technical issue with the application or payment gateway, the amount paid will be refunded to the customer within 5-7 working days.</li>
                            </ul>
                        </section>

                        <section>
                            <h2>Refund Policy</h2>
                            <ul>
                                <li>If the customer is not satisfied with the quality of the food, the restaurant will take appropriate action to address the issue. In such cases, the customer may be eligible for a full or partial refund, depending on the situation.</li>
                                <li>Refunds will be issued to the same payment method used for the original transaction.</li>
                            </ul>
                        </section>

                        <section className="contact-for-issues">
                            <h2>Issues or Concerns?</h2>
                            <p>
                                If there is any issue, the customer or vendor can write to us at <a href="mailto:lacartethe@gmail.com">lacartethe@gmail.com</a>. We are here to help resolve any problems you may encounter.
                            </p>
                        </section>
                    </article>
                </div>
            </div>
         </>
     );
}

export default Refund;

// Add an empty export statement to ensure the file is treated as a module.
export {};
