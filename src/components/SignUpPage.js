import React, { useEffect, useState, useRef } from 'react';
import * as htmlToImage from "html-to-image";
import QRCode from "react-qr-code";
import banner from "../assets/images/banner1.png"
import '../index.css'
import emailjs from "@emailjs/browser";

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        organization: '',
        classSelection: '',
        location: '',
        socialMedia: '',
        comments: ''
    });

    const [submitted, setSubmitted] = useState(false);
    const [qrIsVisible, setQrIsVisible] = useState(false);
    const qrCodeRef = useRef(null);
    const [url, setUrl] = useState("");

    useEffect(() => emailjs.init("wF29FoRbt-yArfmQg"), []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Form data submitted:', formData);
        saveRegistration();
        // Reset form fields
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            organization: '',
            classSelection: '',
            location: '',
            socialMedia: '',
            comments: ''
        });
    };

    const saveRegistration = async () => {
        try {
            const recipientEmail = formData.email;
            const hostname = "creativesummitserver.azurewebsites.net"; // azure hostname && for local = window.location.hostname; port 5000
            const apiUrl = `https://${hostname}/api/create`; // Construct the API URL
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                // Set submitted to true to show success message
                setSubmitted(true);
                // Scroll to the top of the page
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth' // Optional: Smooth scrolling animation
                });
                // Set submitted to false to hide success message after 3 seconds
                setTimeout(() => {
                    setSubmitted(false);
                }, 3000);
                const responseData = await response.json();
                const registrationID = responseData.registrationID;
                // send email the generated QR code
                sendQRCodeEmail(registrationID, recipientEmail);

            } else {
                alert('Failed to insert record');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error inserting record');
        }
    }

    const sendQRCodeEmail = (Id, email, index) => {
        const scanData = { "RegistrationID": Id.toString() };
        setUrl(JSON.stringify(scanData));
        setQrIsVisible(true);
        setTimeout(() => {
            generateQRCode(email);
        }, 100);
    };

    const generateQRCode = (email) => {
        htmlToImage
            .toPng(qrCodeRef.current)
            .then(function (dataUrl) {
                setQrIsVisible(false);
                // send email the generated QR code
                sendEmail(email, dataUrl);
            })
            .catch(function (error) {
                console.error("Error generating QR code:", error);
            });
    };

    const sendEmail = async (recipientEmail, dataUrl) => {
        const hostname = "creativesummitserver.azurewebsites.net"; // azure hostname && for local = window.location.hostname; port 5000
        const apiUrl = `https://${hostname}/api/send-email`; // Construct the API URL
        const data = { email: recipientEmail, qrCodeData: dataUrl }
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (response.ok) {
                alert('Email sent successfully!');
            } else {
                console.log(response);
                alert('Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
        }
    };

    return (
        <div>
            <div style={{ backgroundColor: '#000', padding: "8px" }}>
                <img src={banner} width="250px" alt="Banner" height="60px" />
            </div>
            {
                submitted &&
                <p className="success-message">Form submitted successfully!</p>
            }
            <form className="complete-form" onSubmit={handleSubmit} method="POST">
                <div className="form-group">
                    <label htmlFor="firstName">Name <span className="required">*</span></label>
                    <div className="name-inputs">
                        <input type="text" id="firstName" name="firstName" placeholder="First" value={formData.firstName}
                            onChange={handleChange}
                            required />
                        <input type="text" id="lastName" name="lastName" placeholder="Last" value={formData.lastName}
                            onChange={handleChange}
                            required />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email <span className="required">*</span></label>
                    <input type="email" id="email" name="email" value={formData.email}
                        onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone <span className="required">*</span></label>
                    <input type="tel" id="phone" name="phone" placeholder="(201) 555-0123" value={formData.phone}
                        onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="organization">Organization <span className="required">*</span></label>
                    <input type="text" id="organization" name="organization" value={formData.organization}
                        onChange={handleChange} required />
                    <small>Let us know what organization/church or community you represent. Each organization is limited to (5) persons.</small>
                </div>
                <div className="form-group">
                    <label htmlFor="classSelection">What class will you attend at CS24 <span className="required">*</span></label>
                    <select id="classSelection" name="classSelection" value={formData.classSelection}
                        onChange={handleChange} required>
                        <option value="">PICK (1) CLASS</option>
                        <option value="Video Direction/Editing/Colour Correction">Video Direction/Editing/Colour Correction</option>
                        <option value="Lighting Director/Programing/Staging">Lighting Director/Programing/Staging</option>
                        <option value="Livestreaming/Producing/Broadcast">Livestreaming/Producing/Broadcast</option>
                    </select>
                    <small>Please carefully choose the class that best supports your vision and ministry.</small>
                </div>
                <div className="form-group">
                    <label htmlFor="location">Where are you coming from? <span className="required">*</span></label>
                    <select id="location" name="location" value={formData.location}
                        onChange={handleChange} required>
                        <option value="Berbice">Berbice</option>
                        <option value="Linden">Linden</option>
                        <option value="Georgetown">Georgetown</option>
                        <option value="Bartica">Bartica</option>
                        <option value="Other">Other</option>
                    </select>
                    <small>We would love to know where you are from, we might visit you for Christmas.</small>
                </div>
                <div className="form-group">
                    <label htmlFor="socialMedia">Social Media/website</label>
                    <input type="text" id="socialMedia" name="socialMedia" value={formData.socialMedia}
                        onChange={handleChange} placeholder="Let’s get connected on socials. Drop us your handles.." />
                </div>
                <div className="form-group">
                    <label htmlFor="comments">What are you most excited about CS24?</label>
                    <textarea id="comments" name="comments" rows="4" value={formData.comments}
                        onChange={handleChange}></textarea>
                </div>
                <button type="submit" className="submit-button">Submit</button>
            </form>
            {qrIsVisible && (
                <div className="qrcode__download">
                    <div className="qrcode__image" ref={qrCodeRef}>
                        <QRCode value={url} size={300} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignUpPage;
