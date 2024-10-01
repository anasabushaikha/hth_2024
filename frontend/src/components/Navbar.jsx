import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTaskStore } from '../store/product';
import { triggerGlobalAIHandler } from '../utils/globalFunctions';
import './Navbar.css';

const Navbar = () => {
  const { deleteTask } = useTaskStore();
  const [clickCount, setClickCount] = useState(0);

  const handleSubmit = () => {
    const newClickCount = (clickCount + 2) % 3;
    setClickCount(newClickCount);

    const baseTask = {
      id: "1",
      title: "Drive Dad to the airport",
      starttime: "15:00",
      endtime: "5:00",
      location: "airport",
      description: "Driving Dad to the airport",
      reminder: "15",
      duration: "120",
      focus: "true",
      moveable: "true"
    };

    switch (newClickCount) {
      case 2: // Add task
        triggerGlobalAIHandler([{
          action: "add",
          event: { ...baseTask, date: "2024-09-29" }
        }]);
        console.log('Task added');
        break;
      case 1: // Update task
        console.log("SDFFFFFFFFFFFF")
        triggerGlobalAIHandler([{
          action: "delete",
          event: { id: "99" }
        }]);
        triggerGlobalAIHandler([{
          action: "add",
          event: { ...baseTask, date: "2024-09-30" }
        }]);
        console.log('Task updated', {...baseTask, date: "2024-09-30"});
       
        break;
      case 0: // Delete task
        triggerGlobalAIHandler([{
          action: "delete",
          event: { id: "99" }
        }]);
        console.log('Task deleted');
        break;
    }
  };

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
          <li className="navbar-item">
            <button onClick={handleSubmit} className="navbar-link submit-button">
              <span className="icon">📝</span>
              Submit
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
