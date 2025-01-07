import React from "react";
import { Link } from 'react-router-dom';
import '../CSS/Landing.css';
import logo from '../images/full-logo.png';
import demoVideo from '../videos/collage-demo.mp4';

const Landing = () => {
    return (
        <div className="landing">
            <div className="landing-container">
                <div>
                    <img src={logo} alt="Collage logo" className="landing-logo" /> 
                    
                    <h1 className="landing-tagline">Build your college experience </h1>
                    <p className="landing-description">Collage makes getting through education effortless. Access a personalized course catalog and AI academic advising. Follow your friends to share schedules. Made by college students, for college students.</p>
                    <Link to="/collage/login">
                        <button className="landing-sign-up-button">Get Started</button>
                    </Link>
                    <p className="error-link">Found an error? <a href="https://forms.gle/yarxZdbn2RfaW55w6" target="_blank" rel="noopener noreferrer">Submit a help request</a></p>
                </div>
                <video 
                    className="landing-video-demo"
                    src={demoVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                />
                {/* <Link to="/collage/dev">
                    <button className="landing-sign-up-button">Dev Page</button>
                </Link> */}
                {/* <Link to="/collage/loading">
                    <button className="landing-sign-up-button">Loading</button>
                </Link> */}
            </div>
            <div className="footer">
                {/* &copy; 2024 Collage. All rights reserved.  */}
                <p className="mobile-warning-p">Beta Release: Please access this application on a desktop for the best experience.</p>
            </div>
        </div>
    );
};

export default Landing;