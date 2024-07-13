import React, { useEffect, useState, useRef } from "react";
import '../index.css'
import banner from "../assets/images/banner1.png"
import * as htmlToImage from "html-to-image";
import QRCode from "react-qr-code";

const Dashboard = () => {

    const [data, setData] = useState([]);
    const [checkinData, setCheckinData] = useState({});
    const qrCodeRef = useRef(null);
    const [url, setUrl] = useState("");
    const [qrIsVisible, setQrIsVisible] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const [buttonDisabled, setButtonDisabled] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filterText, setFilterText] = useState('');

    const handleFilterChange = (e) => {
        const searchText = e.target.value.toLowerCase();
        setFilterText(searchText);
        const filteredResults = data.filter(row =>
            row.FirstName.toLowerCase().includes(searchText) ||
            row.LastName.toLowerCase().includes(searchText) ||
            row.Email.toLowerCase().includes(searchText) ||
            row.Phone.toLowerCase().includes(searchText) ||
            row.ClassName.toLowerCase().includes(searchText)
        );
        setFilteredData(filteredResults);
    };

    useEffect(() => {
        getData()
    }, []);

    const toggleRow = async (index, registrationID) => {
        const isExpanded = !expandedRows[index];
        setExpandedRows((prevExpandedRows) => ({
            ...prevExpandedRows,
            [index]: isExpanded,
        }));

        if (isExpanded && !checkinData[index]) {
            // Fetch the check-in data only if expanding and data not already fetched
            const fetchedData = await getCheckinData(registrationID);
            setCheckinData((prevCheckinData) => ({
                ...prevCheckinData,
                [index]: fetchedData,
            }));
        }
    };

    const getData = async () => {
        const hostname = "creativesummitserver.azurewebsites.net"; // azure hostname && for local = window.location.hostname; port 5000
        const apiUrl = `https://${hostname}/api/data`; // Construct the API URL
        await fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then(data => {
                setData(data);
                setFilteredData(data); // Initialize filtered data with original data
                if (data && data.length > 0) {
                    setButtonDisabled(new Array(data.length).fill(false));
                }
                console.log(data);
            })
            .catch(error => {
                console.log(error);
            });
    }

    const getCheckinData = async (id) => {
        const hostname = "creativesummitserver.azurewebsites.net"; // azure hostname && for local = window.location.hostname; port 5000
        const apiUrl = `https://${hostname}/api/checkin/${id}`; // Construct the API URL
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        return data;
    }

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

    const formatCheckinTime = (checkinTime) => {
        return new Date(checkinTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    return (
        <div>
            <div style={{ backgroundColor: '#000', padding: "8px" }}>
                <img src={banner} width="250px" alt="Banner" height="60px" />
            </div>
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Filter by First Name, Last Name, Email, Phone, or Class Name"
                    value={filterText}
                    onChange={handleFilterChange}
                />
            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th></th>
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
                        {filteredData.map((row, index) => (
                            <React.Fragment key={index}>
                                <tr>
                                    <td>
                                        <button className="expand-row-button" onClick={() => toggleRow(index, row.RegistrationID)}>
                                            {expandedRows[index] ? '-' : '+'}
                                        </button>
                                    </td>
                                    <td>{row.FirstName}</td>
                                    <td>{row.LastName}</td>
                                    <td>{row.Email}</td>
                                    <td>{row.Phone}</td>
                                    <td>{row.Organization}</td>
                                    <td>{row.ClassName}</td>
                                    <td>{row.Location}</td>
                                    <td>{row.SocialMedia}</td>
                                    <td>{row.Comment}</td>
                                    <td>
                                        <button className="send-email-button"
                                            onClick={() => sendQRCodeEmail(row.RegistrationID, row.Email, index)}
                                            disabled={buttonDisabled[index]}
                                        >Send Email</button>
                                    </td>
                                </tr>
                                {expandedRows[index] && checkinData[index] && checkinData[index].length > 0 && (
                                    <tr>
                                        <td colSpan="11">
                                            <div className="expanded-content">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {checkinData[index].map((item, index) => (
                                                            <React.Fragment key={index}>
                                                                <tr>
                                                                    <td>{new Date(item.Checkin_Time).toLocaleDateString('en-US')}</td>
                                                                    <td>{formatCheckinTime(item.Checkin_Time)}</td>
                                                                </tr>
                                                            </React.Fragment>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {
                                    expandedRows[index] && checkinData[index] && checkinData[index].length === 0 &&
                                    <tr>
                                        <td colSpan="11"><span>No Data</span></td>
                                    </tr>
                                }
                            </React.Fragment>
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