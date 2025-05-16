import React from 'react'; // Import React, standard for TSX files
import { useNavigate } from "react-router-dom"; // Changed from "react-router" to "react-router-dom"
import './Footer.scss';

const Footer: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigate = (path: string) => (event: React.MouseEvent<HTMLDivElement>) => {
        navigate(path);
    };

    return (
        <div className="Footer">
             <div className="footer-header" onClick={handleNavigate('/')}>
                La Carte
             </div>
             <div className="footer-links">
                 <div className="footer-link" onClick={handleNavigate('/contact')}>
                     Contact Us
                 </div>
                 <div className="footer-link" onClick={handleNavigate('/refund')}>
                     Refund and Cancellation Policy
                 </div>
                 {/* <div className="footer-link" onClick={handleNavigate('/cancellation')}>
                     Cancellation
                 </div> */}
                 {/* <div className="footer-link" onClick={handleNavigate('/shipping')}>
                     Shipping
                 </div> */}
                  <div className="footer-link" onClick={handleNavigate('/login')}>
                     Vendor Login
                 </div>
                 <div className="footer-link" onClick={handleNavigate('/privacy')}>
                     Privacy/Policy
                 </div>
                 <div className="footer-link" onClick={handleNavigate('/terms-and-condition')}>
                     Terms and Conditions
                 </div>
             </div>
             <div className="copyright">
                Made with ♥️ by <a href="https://bchikara.vercel.app" target="_blank" rel="noopener noreferrer">bchikara</a>
             </div>
        </div>
    );
}

export default Footer;
