import React, { useEffect, useState, useRef } from "react";
import '../index.css'
import banner from "../assets/images/banner1.png"
import * as htmlToImage from "html-to-image";
import QRCode from "react-qr-code";

const Dashboard = () => {

    const [data, setData] = useState([]);
    const qrCodeRef = useRef(null);
    const [url, setUrl] = useState("");
    const [qrIsVisible, setQrIsVisible] = useState(false);

    const [rows, setRows] = useState([]);
    const [buttonDisabled, setButtonDisabled] = useState([]);

    useEffect(() => {
        const hostname = window.location.hostname; // Get the current hostname
        const apiUrl = `http://${hostname}:5000/api/data`; // Construct the API URL
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then(data => {
                setData(data);
                if (data && data.length > 0) {
                    setRows(data);
                    setButtonDisabled(new Array(data.length).fill(false));
                }
                console.log(data);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    const sendQRCodeEmail = (Id, email, index) => {
        const updatedButtonDisabled = [...buttonDisabled];
        updatedButtonDisabled[index] = true;
        setButtonDisabled(updatedButtonDisabled);
        const scanData = { "RegistrationID": Id.toString() };
        setUrl(JSON.stringify(scanData));
        setQrIsVisible(true);
        setTimeout(() => {
            generateQRCode(email);
        }, 3000);
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
        const hostname = window.location.hostname; // Get the current hostname
        const apiUrl = `http://${hostname}:5000/api/send-email`; // Construct the API URL
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
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Organization</th>
                            <th>Class Name</th>
                            <th>Location</th>
                            <th>Social Media</th>
                            <th>Comment</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                <td>{row.FirstName}</td>
                                <td>{row.LastName}</td>
                                <td>{row.Email}</td>
                                <td>{row.Phone}</td>
                                <td>{row.Organization}</td>
                                <td>{row.ClassName}</td>
                                <td>{row.Location}</td>
                                <td>{row.SocialMedia}</td>
                                <td>{row.Comment}</td>
                                <td><button className="send-email-button"
                                    onClick={() => sendQRCodeEmail(row.RegistrationID, row.Email, index)}
                                    disabled={buttonDisabled[index]}
                                >Send Email</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {qrIsVisible && (
                <div className="qrcode__download">
                    <div className="qrcode__image" ref={qrCodeRef}>
                        <QRCode value={url} size={300} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;