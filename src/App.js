import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Scan from './components/scan';
import SignUpPage from './components/SignUpPage';
import Dashboard from './components/dashboard';
import Home from './components/home';
import './style.css';

const App = () => {
  return (
    <Router>
      <div className="main-header">
        <nav>
          <ul>
            <li><Link to="/home">Home</Link></li>
            <li><Link to="/scan">Scan</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </nav>
      </div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='/scan' element={<Scan />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;