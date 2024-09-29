import React, { useState, useCallback, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Timetable from './components/Timetable'
import BlockWebsite from './components/BlockWebsite'
import CloudDecoration from './components/CloudDecoration'
import { useTaskStore } from './store/product'
import './App.css'
import { setGlobalAIHandler } from './utils/globalFunctions';
import axios from 'axios'


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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:3000/getAcc');
        console.log("Actual",response)
        handleAIInput(response);
        if (response.data.success && response.data.events) {
          // Add the events to the task store
          response.data.events.forEach(event => {
            const newTask = {
              id: event.id,
              title: event.title,
              date: event.date,
              startTime: event.starttime,
              duration: parseInt(event.duration),
              description: event.description,
              location: event.location,
              reminder: event.reminder,
              focus: event.focus === 'true',
              moveable: event.moveable === 'true'
            };
            addTask(newTask);
          });
          console.log('Fetched events and added to store:', response.data.events);
        } else {
          console.log('No events found');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [addTask]);


  const handleAIInput = useCallback((aiInput) => {
    console.log("THIS IS AI INPUT", aiInput)
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


