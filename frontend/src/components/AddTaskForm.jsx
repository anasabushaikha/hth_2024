import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTaskStore from '../product'

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
    <div className="add-task-form">
      <h2>Add New Task</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Duration (in minutes)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
        <button type="submit">Add Task</button>
      </form>
    </div>
  )
}

export default AddTaskForm