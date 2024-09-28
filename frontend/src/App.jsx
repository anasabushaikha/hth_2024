import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Timetable from './components/Timetable'
import AddTaskForm from './components/AddTaskForm'
import './App.css'

function App() {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })

  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setDate(prevDate.getDate() - 7)
      return newDate
    })
  }

  const goToNextWeek = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setDate(prevDate.getDate() + 7)
      return newDate
    })
  }

  return (
    <div className="app">
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={
            <div className="timetable-container">
              <button className="nav-button prev" onClick={goToPreviousWeek}>
                <span className="arrow-icon">&gt;</span>
              </button>
              <Timetable currentDate={currentDate} />
              <button className="nav-button next" onClick={goToNextWeek}>
                <span className="arrow-icon">&gt;</span>
              </button>
            </div>
          } />
          <Route path="/add-task" element={<AddTaskForm />} />
        </Routes>
      </div>
    </div>
  )
}

export default App

