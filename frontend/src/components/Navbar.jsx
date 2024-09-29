import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTaskStore } from '../store/product';
import { triggerGlobalAIHandler } from '../utils/globalFunctions';
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
          triggerGlobalAIHandler(response.data.acc);
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching acc:', error);
      }
    };

    fetchAcc();
  }, []);

  const { deleteTask } = useTaskStore();

  const handleAIButtonClick = () => {
    const exampleAIInput = [
      {
        action: "add",
        event: {
          id: "1",
          title: "AI Generated Task",
          starttime: "08:00",
          endtime: "15:00",
          location: "Virtual",
          description: "This is an AI generated task",
          reminder: "15",
          date: new Date().toISOString().split('T')[0],
          duration: "60",
          focus: "true",
          moveable: "true"
        }
      }
    ];
    triggerGlobalAIHandler(exampleAIInput);
  };

  const handleUpdateTasks = () => {
    console.log('Updating tasks...');
    const exampleAIInput = [
      {
        action: "update",
        event: {
          id: "1",
          title: "HIHIHI",
          starttime: "12:00",
          endtime: "15:00",
          location: "Virtual",
          description: "This is an AI generated task",
          reminder: "15",
          date: new Date().toISOString().split('T')[0],
          duration: "60",
          focus: "true",
          moveable: "true"
        }
      }
    ];
    triggerGlobalAIHandler(exampleAIInput);
  };

  const handleDeleteTask1 = () => {
    triggerGlobalAIHandler([{ action: "delete", event: { id: "1" } }]);
    console.log('Deleted task with id 1');
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
            <button onClick={handleAIButtonClick} className="navbar-link ai-button">
              <span className="icon">🤖</span>
              Generate AI Task
            </button>
          </li>
          <li className="navbar-item">
            <button onClick={handleUpdateTasks} className="navbar-link update-tasks-button">
              <span className="icon">🔄</span>
              Update Tasks
            </button>
          </li>
          <li className="navbar-item">
            <button onClick={handleDeleteTask1} className="navbar-link delete-task-button">
              <span className="icon">🗑️</span>
              Delete Task 1
            </button>
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
