import React, { useEffect, useState, useRef } from 'react';
import QrReader from "react-qr-reader";
import jsQR from 'jsqr';

const Scan = () => {
  const [result, setResult] = useState('');
  const [session, setSession] = useState('');
  const [error, setError] = useState('');
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const fileInputRef = useRef(null);

  const handleScan = data => {
    if (data) {
      console.log('Scanned Data:', data);
      try {
        const obj = JSON.parse(data);
        console.log(obj.RegistrationID);
        getRegistrationDetail(obj.RegistrationID);
        setIsCameraEnabled(false);  // Disable camera after successful scan
      } catch (error) {
        setError('Invalid QR code format');
      }
    }
  };

  const handleError = err => {
    console.error('Error:', err);
    setError(err.message);
  };

  const handleUpload = event => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0, img.width, img.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            const obj = JSON.parse(code.data);
            console.log(obj.RegistrationID);
            getRegistrationDetail(obj.RegistrationID);
            logAttendance(obj.RegistrationID);
          } else {
            setError('No QR code found in the image');
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

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

  useEffect(() => {
    // Re-enable camera when component mounts or when result is reset
    if (!isCameraEnabled) {
      setIsCameraEnabled(true);
    }
  }, [isCameraEnabled]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>QR Code Scanner & Uploader</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {isCameraEnabled && (
        <QrReader
          delay={100}
          onError={handleError}
          onScan={handleScan}
          style={{ width: '300px', margin: '0 auto' }}
        />
      )}
      <p>OR</p>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleUpload}
        style={{ marginTop: '20px' }}
      />
      <p>{result}</p>
      <p>{session}</p>
    </div>
  );
};

export default Scan;
