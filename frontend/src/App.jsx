import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Timetable from './components/Timetable'
import BlockWebsite from './components/BlockWebsite'
import CloudDecoration from './components/CloudDecoration'
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
      <CloudDecoration position="left" />
      <CloudDecoration position="right" />
      <div className="content">
        <Routes>
          <Route path="/" element={
            <div className="timetable-container">
              <Timetable 
                currentDate={currentDate} 
                goToPreviousWeek={goToPreviousWeek}
                goToNextWeek={goToNextWeek}
              />
            </div>
          } />
          <Route path="/block-website" element={<BlockWebsite />} />
        </Routes>
      </div>
    </div>
  )
}

export default App

