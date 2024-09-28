import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span role="img" aria-label="calendar">📅</span>
          TimeTable Mommie
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          <li className="navbar-item">
            <Link to="/add-task" className="navbar-link">Add Task</Link>
          </li>
          <li className="navbar-item">
            <Link to="/block-website" className="navbar-link block-website-btn">Block Website</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
