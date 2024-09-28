 
 
 
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Timetable from './components/Timetable';
import AddTaskForm from './components/AddTaskForm';
import './App.css';
import useTaskStore, { useFetchTasks } from './product';  // Import task store and fetch hook
 
function App() {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
 
  // Fetch tasks from server when the app loads
  useFetchTasks();  // This will populate the tasks from the server
 
  const tasks = useTaskStore((state) => state.tasks);  // Get tasks from the Zustand store
 
  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() - 7);
      return newDate;
    });
  };
 
  const goToNextWeek = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + 7);
      return newDate;
    });
  };
 
  return (
    <div className="app">
      <Navbar />
      <div className="content">
        <Routes>
          <Route
            path="/"
            element={
              <div className="timetable-container">
                <button className="nav-button prev" onClick={goToPreviousWeek}>
                  <span className="arrow-icon">&gt;</span>
                </button>
                {/* Pass tasks to Timetable component */}
                <Timetable currentDate={currentDate} tasks={tasks} />
                <button className="nav-button next" onClick={goToNextWeek}>
                  <span className="arrow-icon">&gt;</span>
                </button>
              </div>
            }
          />
          <Route path="/add-task" element={<AddTaskForm />} />
        </Routes>
      </div>
    </div>
  );
}
 
export default App;
 
 