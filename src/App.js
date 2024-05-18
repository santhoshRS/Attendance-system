import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Scan from './components/scan';
import QRCode from './components/QrCodeGenerator';
import SignUpPage from './components/SignUpPage';
import './style.css';

const App = () => {
  return (
    <Router>
      <div className="main-header">
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/scan">Scan</Link></li>
            <li><Link to="/qrCode">QR Code Generator</Link></li>
            <li><Link to="/signup">Sign Up Page</Link></li>
          </ul>
        </nav>
      </div>
      <Routes>
          <Route path='/scan' element={<Scan />} />
          <Route path='/qrCode' element={<QRCode />} />
          <Route path='/signup' element={<SignUpPage />} />
        </Routes>
    </Router>
  );
};

export default App;