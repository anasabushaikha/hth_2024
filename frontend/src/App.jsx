import React, { useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Timetable from './components/Timetable'
import BlockWebsite from './components/BlockWebsite'
import CloudDecoration from './components/CloudDecoration'
import { useTaskStore } from './store/product'
import './App.css'
import { setGlobalAIHandler } from './utils/globalFunctions';

function App() {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })

  const { addTask, updateTask, deleteTask } = useTaskStore()

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

  const handleAIInput = useCallback((aiInput) => {
    aiInput.forEach(item => {
      if (item.action === "add") {
        const newTask = {
          id: Date.now().toString(),
          title: item.event.title,
          date: item.event.date,
          startTime: item.event.starttime,
          duration: parseInt(item.event.duration),
          description: item.event.description,
          location: item.event.location,
          reminder: item.event.reminder,
          focus: item.event.focus === "true",
          moveable: item.event.moveable === "true"
        };
        addTask(newTask);
        console.log('Task added:', newTask.title);
      } else if (item.action === "update") {
        updateTask(item.event.id, item.event);
        console.log('Task updated:', item.event.title);
      } else if (item.action === "delete") {
        deleteTask(item.event.id);
        console.log('Task deleted:', item.event.id);
      }
    });
  }, [addTask, updateTask, deleteTask]);

  // Set the global AI handler
  setGlobalAIHandler(handleAIInput);

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


