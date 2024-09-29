import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import axios from 'axios';

const Navbar = () => {
  const [acc, setAcc] = useState(null);

  useEffect(() => {
    // Fetch the acc value from the server
    const fetchAcc = async () => {
      try {
        const response = await axios.get('http://localhost:3000/getAcc');
        if (response.data.success) {
          setAcc(response.data.acc);
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching acc:', error);
      }
    };

    fetchAcc();
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span role="img" aria-label="calendar">📅</span>
          <span className="navbar-logo-text">TimeTable Sweetie</span>
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">
              <span className="icon">🏠</span>
              Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/block-website" className="navbar-link block-website-btn">
              <span className="icon">🚫</span>
              Block Website
            </Link>
          </li>
        </ul>
        {acc && (
          <div className="acc-display">
            <span>Action: {acc}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
