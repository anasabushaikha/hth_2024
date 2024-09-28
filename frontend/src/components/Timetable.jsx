import React, { useState, useMemo, useEffect } from 'react'
import useTaskStore from '../store/product'

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const TaskItem = ({ task, onDelete, onMove, timeRange, onClick }) => {
  const colors = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFD1DC']
  const bgColor = colors[Math.floor(Math.random() * colors.length)]

  const [startHour, startMinute] = task.startTime.split(':').map(Number)
  const startMinutes = startHour * 60 + startMinute
  const taskStart = (startMinutes - timeRange.start * 60) / 60
  const taskHeight = task.duration / 60

  return (
    <div
      className="task-item"
      style={{
        top: `${taskStart * 60}px`,
        height: `${taskHeight * 60}px`,
        borderLeftColor: bgColor,
      }}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify(task))}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onMove(e, task.date, task.startTime)}
      onClick={() => onClick(task)}
    >
      <div className="task-title">{task.title}</div>
      <div className="task-duration">{task.duration} min</div>
    </div>
  )
}

const TaskModal = ({ task, onClose, onDelete }) => {
  if (!task) return null;

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{task.title}</h2>
        <div className="task-details">
          <div className="task-detail-item">
            <span className="task-icon">📅</span>
            <span>{task.date}</span>
          </div>
          <div className="task-detail-item">
            <span className="task-icon">🕒</span>
            <span>{task.startTime}</span>
          </div>
          <div className="task-detail-item">
            <span className="task-icon">⏱️</span>
            <span>{task.duration} minutes</span>
          </div>
        </div>
        <div className="task-description">
          <strong>Description:</strong>
          <p>{task.description || 'No description provided.'}</p>
        </div>
        <div className="button-group">
          <button className="delete-button" onClick={() => onDelete(task.id)}>Delete Task</button>
          <button className="close-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

const Timetable = ({ currentDate }) => {
  const { tasks, deleteTask, updateTask } = useTaskStore()
  const [visibleDays, setVisibleDays] = useState(7)
  const [selectedTask, setSelectedTask] = useState(null)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleDays(3)
      } else if (window.innerWidth < 1024) {
        setVisibleDays(5)
      } else {
        setVisibleDays(7)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [tasks])

  const weekDates = useMemo(() => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate)
      date.setDate(currentDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [currentDate])

  const timeRange = useMemo(() => {
    let earliestTime = 23 * 60 // Convert to minutes
    let latestTime = 0
    tasks.forEach(task => {
      const [hours, minutes] = task.startTime.split(':').map(Number)
      const taskStartMinutes = hours * 60 + minutes
      const taskEndMinutes = taskStartMinutes + task.duration

      earliestTime = Math.min(earliestTime, taskStartMinutes)
      latestTime = Math.max(latestTime, taskEndMinutes)
    })
    return {
      start: Math.floor(earliestTime / 60),
      end: Math.ceil(latestTime / 60)
    }
  }, [tasks])

  const timeSlots = useMemo(() => {
    return Array.from(
      { length: timeRange.end - timeRange.start },
      (_, i) => `${(i + timeRange.start).toString().padStart(2, '0')}:00`
    )
  }, [timeRange])

  const visibleWeekDates = useMemo(() => {
    return weekDates.slice(0, visibleDays)
  }, [weekDates, visibleDays])

  const handleDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId)
      setSelectedTask(null)
    }
  }

  const handleMove = (e, targetDate, targetTime) => {
    e.preventDefault()
    const sourceTask = JSON.parse(e.dataTransfer.getData('text/plain'))
    if (sourceTask.date !== targetDate || sourceTask.startTime !== targetTime) {
      const updatedTask = { ...sourceTask, date: targetDate, startTime: targetTime }
      updateTask(sourceTask.id, updatedTask)
    }
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  return (
    <div className="timetable">
      <div className="timetable-grid">
        <div className="time-column">
          <div className="day-header"></div>
          {timeSlots.map((time) => (
            <div key={time} className="time-slot">{time}</div>
          ))}
        </div>
        {visibleWeekDates.map((date) => {
          const dayOfWeek = daysOfWeek[date.getDay()]
          const formattedDate = date.toISOString().split('T')[0]
          return (
            <div key={formattedDate} className="day-column">
              <div className="day-header">
                {dayOfWeek}<br />
                {formattedDate}
              </div>
              <div className="day-tasks">
                {timeSlots.map((time) => (
                  <div
                    key={`${formattedDate}-${time}`}
                    className="time-slot"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleMove(e, formattedDate, time)}
                  ></div>
                ))}
                {tasks
                  .filter((task) => task.date === formattedDate)
                  .map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onDelete={handleDelete}
                      onMove={handleMove}
                      timeRange={timeRange}
                      onClick={handleTaskClick}
                    />
                  ))}
              </div>
            </div>
          )
        })}
      </div>
      <TaskModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onDelete={handleDelete}
      />
    </div>
  )
}

export default Timetable