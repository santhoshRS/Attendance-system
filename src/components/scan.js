import React, { useState } from 'react';
import QrReader from 'react-qr-scanner';
import '../index.css';

const Scan = () => {
  const [result, setResult] = useState('');
  const [session, setSession] = useState('');
  const [error, setError] = useState('');
  const [newScan, setNewScan] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // Initialize with back camera

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
    if (err.name === 'OverconstrainedError') {
      setError('No suitable camera found');
    } else {
      setError('Error accessing camera');
    }
  }

  const getRegistrationDetail = async (id) => {
    try {
      const hostname = "creativesummitserver.azurewebsites.net"; // azure hostname && for local = window.location.hostname; port 5000
      const apiUrl = `https://${hostname}/api/data/${id}`;
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
      const hostname = "creativesummitserver.azurewebsites.net"; // azure hostname && for local = window.location.hostname; port 5000
      const apiUrl = `https://${hostname}/api/checkin`;
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
    height: 250,
    width: 250,
  }

  const videoConstraints = {
    facingMode: facingMode // Use state for camera mode
  };

  const toggleFacingMode = () => {
    setFacingMode((prevMode) => (prevMode === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>QR Code Scanner</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {
        newScan &&
        <button type="button" className="submit-button"
          onClick={() => setNewScan(false)}>Scan New QR Code</button>
      }
      {!newScan && (
        <>
          <QrReader
            delay={100}
            style={previewStyle}
            constraints={{ video: videoConstraints }}
            onError={handleError}
            onScan={handleScan}
          />
          <button type="button" className="submit-button" onClick={toggleFacingMode}>
            Switch Camera
          </button>
        </>
      )}
      <h1>{result}</h1>
      <h1>{session}</h1>
    </div>
  );
};

export default Scan;
