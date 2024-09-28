import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTaskStore } from '../store/product'
import './AddTaskForm.css'

const AddTaskForm = () => {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState('')
  const { addTask } = useTaskStore()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const result = addTask({ title, date, startTime, duration: parseInt(duration) })
    if (result.success) {
      alert('Task added successfully')
      navigate('/')
    } else {
      alert(`Error: ${result.message}`)
    }
  }

  return (
    <div className="add-task-container">
      <div className="floating-element heart">❤️</div>
      <div className="floating-element star">⭐</div>
      <div className="floating-element cloud">☁️</div>
      <h2>Add New Task</h2>
      <form onSubmit={handleSubmit} className="add-task-form">
        <div className="input-container">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <label className="input-label">Task Title</label>
        </div>
        <div className="input-container">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <label className="input-label">Date</label>
        </div>
        <div className="input-container">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <label className="input-label">Start Time</label>
        </div>
        <div className="input-container">
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
          <label className="input-label">Duration (minutes)</label>
        </div>
        <button type="submit" className="add-button">Add Task</button>
      </form>
    </div>
  )
}

export default AddTaskForm