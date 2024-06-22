import React, { useState } from 'react';
import QrReader from 'react-qr-scanner';
import '../index.css';

const Scan = () => {
  const [result, setResult] = useState('');
  const [session, setSession] = useState('');
  const [error, setError] = useState('');
  const [newScan, setNewScan] = useState(false);

  const handleScan = (data) => {
    if (data) {
      const obj = JSON.parse(data.text);
      console.log(obj.RegistrationID);
      getRegistrationDetail(obj.RegistrationID);
      logAttendance(obj.RegistrationID);
      setNewScan(true);
    }
  }

  const handleError = (err) => {
    setError(err);
  }

  const getRegistrationDetail = async (id) => {
    try {
      const hostname = window.location.hostname;
      const apiUrl = `http://${hostname}:5000/api/data/${id}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      if (data && data.length > 0) {
        setResult(`${data[0].FirstName} ${data[0].LastName}`);
        setSession(data[0].ClassName);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch data');
    }
  };

  const logAttendance = async (id) => {
    try {
      const hostname = window.location.hostname;
      const apiUrl = `http://${hostname}:5000/api/checkin`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id }),
      });
      if (!response.ok) {
        throw new Error('Failed to log attendance');
      }
      alert('Attendance logged successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error logging attendance');
    }
  };

  const previewStyle = {
    height: 240,
    width: 320,
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>QR Code Scanner</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {
        newScan &&
        <button type="button" className="submit-button"
          onClick={() => setNewScan(false)}>Scan New QR Code</button>
      }
      {
        !newScan && <QrReader
          delay={100}
          style={previewStyle}
          onError={handleError}
          onScan={handleScan}
        />
      }
      <p>{result}</p>
      <p>{session}</p>
    </div>
  );
};

export default Scan;
