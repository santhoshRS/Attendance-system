import React, { useEffect, useState } from "react";
import '../index.css'
import banner from "../assets/images/banner1.png"

const Dashboard = () => {

    const [data, setData] = useState([]);

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
                console.log(data);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;