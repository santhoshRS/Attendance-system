import React from "react";
import '../index.css'
import main_banner from "../assets/images/main_banner.png"
import main_banner_mobile from "../assets/images/main_banner_mobile.png"

const Home = () => {


    return (
        <div className="image-container">
            <img
                src={main_banner}
                alt="Desktop Image"
                className="desktop-image"
            />
            <img
                src={main_banner_mobile}
                alt="Mobile Image"
                className="mobile-image"
            />
        </div>
    );
}

export default Home;