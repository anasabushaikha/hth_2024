import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
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
      </div>
    </nav>
  );
};

export default Navbar;
