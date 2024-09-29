import React from 'react';
import { Link } from 'react-router-dom';
import { useTaskStore } from '../store/product';  // Import useTaskStore
import { useTaskStore } from '../store/product';  // Import useTaskStore
import './Navbar.css';

const Navbar = ({ handleAIInput }) => {
  const { deleteTask } = useTaskStore();  // Get deleteTask function from the store

  const handleAIButtonClick = () => {
    if (handleAIInput) {

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
      handleAIInput(exampleAIInput);
    } else {
      console.error('handleAIInput is not available');
    }
  };

  const handleUpdateTasks = () => {
    console.log('Updating tasks...');
    if (handleAIInput) {
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
      handleAIInput(exampleAIInput);
    } else {
      console.error('handleUpdateTasks is not available');
    }
  };

  const handleDeleteTask1 = () => {
    deleteTask("1");  // Delete task with id "1"
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
      </div>
    </nav>
  );
};


export default Navbar;
