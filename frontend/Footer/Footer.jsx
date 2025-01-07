import React from "react";
import { Link } from 'react-router-dom';
import '../CSS/Footer.css';

const Footer = () => {
    return (
        <div className="foot">
            <div className="links">
                <div className="sub legal">
                    <h2>Legal</h2>
                    <Link to="/collage/PrivacyPolicy">
                        <button className="link">Privacy Policy</button>
                    </Link>
                    <Link to="/collage/Terms">
                        <button className="link">Terms & Conditions</button>
                    </Link>
                </div>
                <div className="sub socials">
                    <h2>Socials</h2>
                    <Link to="https://www.instagram.com/collage.us/">
                        <button className="link">Instagram</button>
                    </Link>
                    <Link to="https://www.linkedin.com/company/collageus/">
                        <button className="link">Linkedin</button>
                    </Link>
                </div>
            </div>
            <div className="copyright">
                <p>© Collage, Inc. 2024. All Rights Reserved.</p>
            </div>
        </div>
    )
};

export default Footer;