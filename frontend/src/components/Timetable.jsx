import React, { useState, useMemo, useEffect } from 'react'
import {useTaskStore, useFetchTasks} from '../store/product'
import axios from 'axios'
import './Timetable.css'


const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']


const TaskItem = ({ task, onDelete, onMove, timeRange, onClick, hourHeight }) => {
  const [isDeleting, setIsDeleting] = useState(false);

const TaskItem = ({ task, onDelete, onMove, timeRange, onClick, hourHeight }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const colors = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFD1DC']
  const bgColor = colors[Math.floor(Math.random() * colors.length)]



  const [startHour, startMinute] = task.startTime.split(':').map(Number)
  const startMinutes = startHour * 60 + startMinute
  const taskStart = (startMinutes - timeRange.start * 60) / 60
  const taskHeight = task.duration / 60



  const formatTime = (time) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }



  const minHeight = 24 // Minimum height to display the title
  const isShortTask = taskHeight * hourHeight < minHeight * 2 // Check if task is too short to display all info


  let clickTimer = null;


  const handleClick = () => {
    if (clickTimer === null) {
      clickTimer = setTimeout(() => {
        clickTimer = null;
        onClick(task);
      }, 200);
    } else {
      clearTimeout(clickTimer);
      clickTimer = null;
      handleDoubleClick();
    }
  };


  const handleDoubleClick = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(task.id), 500); // Wait for animation to finish
  };

  const isShortTask = taskHeight * hourHeight < minHeight * 2 // Check if task is too short to display all info


  let clickTimer = null;


  const handleClick = () => {
    if (clickTimer === null) {
      clickTimer = setTimeout(() => {
        clickTimer = null;
        onClick(task);
      }, 200);
    } else {
      clearTimeout(clickTimer);
      clickTimer = null;
      handleDoubleClick();
    }
  };


  const handleDoubleClick = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(task.id), 500); // Wait for animation to finish
  };


  return (
    <div
      className={`task-item ${isShortTask ? 'short-task' : ''} ${isDeleting ? 'deleting' : ''}`}
      className={`task-item ${isShortTask ? 'short-task' : ''} ${isDeleting ? 'deleting' : ''}`}
      style={{
        top: `${taskStart * hourHeight}px`, // Removed the 60px offset
        height: `${Math.max(taskHeight * hourHeight, minHeight)}px`,
        top: `${taskStart * hourHeight}px`, // Removed the 60px offset
        height: `${Math.max(taskHeight * hourHeight, minHeight)}px`,
        borderLeftColor: bgColor,
      }}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/plain', JSON.stringify(task))}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onMove(e, task.date, task.startTime)}
      onClick={handleClick}
      onClick={handleClick}
    >
      <div className="task-content">
        <div className="task-title">{task.title}</div>
        {!isShortTask && (
          <>
            <div className="task-time">{formatTime(task.startTime)}</div>
            <div className="task-duration">{task.duration} min</div>
          </>
        )}
      </div>
      <div className="task-content">
        <div className="task-title">{task.title}</div>
        {!isShortTask && (
          <>
            <div className="task-time">{formatTime(task.startTime)}</div>
            <div className="task-duration">{task.duration} min</div>
          </>
        )}
      </div>
    </div>
  )
}



const TaskModal = ({ task, onClose, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);


  useEffect(() => {
    if (task) {
      // Use setTimeout to ensure the modal is rendered before adding the 'open' class
      setTimeout(() => setIsOpen(true), 50);
    } else {
      setIsOpen(false);
    }
  }, [task]);


  if (!task) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);


  useEffect(() => {
    if (task) {
      // Use setTimeout to ensure the modal is rendered before adding the 'open' class
      setTimeout(() => setIsOpen(true), 50);
    } else {
      setIsOpen(false);
    }
  }, [task]);


  if (!task) {
    return null;
  }


  const formatDateTime = (dateString, timeString) => {
    const date = new Date(dateString);
    const currentYear = new Date().getFullYear();
    const [hours, minutes] = timeString.split(':');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours}:${minutes} ${ampm}`;
   
    const options = {
      weekday: 'long',
      month: 'long',
   
    const options = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== currentYear ? 'numeric' : undefined
    };
   
   
    const formattedDate = date.toLocaleDateString('en-US', options);
    return `${formattedDate} at ${formattedTime}`;
  };


  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for the closing animation to finish
  };



  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for the closing animation to finish
  };


  return (
    <div className={`task-modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleClose}>
      <div className={`task-modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
    <div className={`task-modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleClose}>
      <div className={`task-modal-content ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <h2>{task.title}</h2>
        <div className="task-details">
          <div className="task-detail-item">
            <span className="task-icon">📅</span>
            <span>{formatDateTime(task.date, task.startTime)}</span>
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
          <button className="close-button" onClick={handleClose}>Close</button>
          <button className="close-button" onClick={handleClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

const Timetable = ({ currentDate, goToPreviousWeek, goToNextWeek, onAIInput }) => {
  const { tasks, addTask, deleteTask, updateTask } = useTaskStore()
  
  // Add this console.log
const Timetable = ({ currentDate, goToPreviousWeek, goToNextWeek, onAIInput }) => {
  const { tasks, addTask, deleteTask, updateTask } = useTaskStore()
  
  // Add this console.log
  const [selectedTask, setSelectedTask] = useState(null)


  // TODO: use state & use effect
  const x = useFetchTasks()


  const visibleDates = useMemo(() => {

  // TODO: use state & use effect
  const x = useFetchTasks()


  const visibleDates = useMemo(() => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate)
      date.setDate(currentDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }, [currentDate])



  const timeRange = useMemo(() => {
    const yesterday = new Date(visibleDates[0])
    yesterday.setDate(yesterday.getDate() - 1)
    const lastDay = new Date(visibleDates[6])
   
    const relevantTasks = tasks.filter(task => {
      const taskDate = new Date(task.date)
      return taskDate >= yesterday && taskDate <= lastDay
    })
     
    if (relevantTasks.length === 0) return { start: 0, end: 24 }


    let earliestTime = 24 * 60 // Convert to minutes
    const yesterday = new Date(visibleDates[0])
    yesterday.setDate(yesterday.getDate() - 1)
    const lastDay = new Date(visibleDates[6])
   
    const relevantTasks = tasks.filter(task => {
      const taskDate = new Date(task.date)
      return taskDate >= yesterday && taskDate <= lastDay
    })
     
    if (relevantTasks.length === 0) return { start: 0, end: 24 }


    let earliestTime = 24 * 60 // Convert to minutes
    let latestTime = 0
    relevantTasks.forEach(task => {
    relevantTasks.forEach(task => {
      const [hours, minutes] = task.startTime.split(':').map(Number)
      const taskStartMinutes = hours * 60 + minutes
      const taskEndMinutes = taskStartMinutes + task.duration



      earliestTime = Math.min(earliestTime, taskStartMinutes)
      latestTime = Math.max(latestTime, taskEndMinutes)
    })


    // Ensure a minimum range of 6 hours and round to the nearest hour
    const minRange = 6 * 60 // 6 hours in minutes
    const rangeInMinutes = Math.max(latestTime - earliestTime, minRange)
   


    // Ensure a minimum range of 6 hours and round to the nearest hour
    const minRange = 6 * 60 // 6 hours in minutes
    const rangeInMinutes = Math.max(latestTime - earliestTime, minRange)
   
    return {
      start: Math.max(0, Math.floor(earliestTime / 60) - 1),
      end: Math.min(24, Math.ceil((earliestTime + rangeInMinutes) / 60) + 1)
      start: Math.max(0, Math.floor(earliestTime / 60) - 1),
      end: Math.min(24, Math.ceil((earliestTime + rangeInMinutes) / 60) + 1)
    }
  }, [tasks, visibleDates])

  }, [tasks, visibleDates])


  const timeSlots = useMemo(() => {
    return Array.from(
      { length: timeRange.end - timeRange.start },
      (_, i) => `${(i + timeRange.start).toString().padStart(2, '0')}:00`
    )
  }, [timeRange])


  const handleDelete = (taskId) => {
    deleteTask(taskId)
    setSelectedTask(null)
  }

    deleteTask(taskId)
    setSelectedTask(null)
  }


  const handleMove = (e, targetDate, targetTime) => {
    e.preventDefault();
    const sourceTask = JSON.parse(e.dataTransfer.getData('text/plain'));
   
    // Adjust the target time by adding one hour (60 minutes)
    const [hours, minutes] = targetTime.split(':').map(Number);
    const adjustedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
   
    if (sourceTask.date !== targetDate || sourceTask.startTime !== adjustedTime) {
      const updatedSourceTask = { ...sourceTask, date: targetDate, startTime: adjustedTime };
     
      // Calculate the end time of the moved task
      const sourceEndTime = new Date(`2000-01-01T${adjustedTime}`);
      sourceEndTime.setMinutes(sourceEndTime.getMinutes() + updatedSourceTask.duration);
      const sourceEndTimeString = sourceEndTime.toTimeString().slice(0, 5);


      // Find tasks that might need to be moved
      const tasksToCheck = tasks.filter(task =>
        task.date === targetDate &&
        task.id !== sourceTask.id &&
        task.startTime >= adjustedTime
      ).sort((a, b) => a.startTime.localeCompare(b.startTime));


      const updatedTasks = [updatedSourceTask];
      let currentEndTime = sourceEndTime;


      tasksToCheck.forEach(task => {
        const taskStartTime = new Date(`2000-01-01T${task.startTime}`);
        if (taskStartTime < currentEndTime) {
          // This task needs to be moved
          const newStartTime = currentEndTime.toTimeString().slice(0, 5);
          const updatedTask = { ...task, startTime: newStartTime };
          updatedTasks.push(updatedTask);


          // Update currentEndTime for the next iteration
          currentEndTime = new Date(`2000-01-01T${newStartTime}`);
          currentEndTime.setMinutes(currentEndTime.getMinutes() + task.duration);
        } else {
          // This task doesn't need to be moved
          updatedTasks.push(task);
          currentEndTime = new Date(`2000-01-01T${task.startTime}`);
          currentEndTime.setMinutes(currentEndTime.getMinutes() + task.duration);
        }
      });


      // Update all affected tasks
      updatedTasks.forEach(task => {
        console.log('Updating task:', task.id, task);
        updateTask(task.id, task);
      });
    }
  };

    e.preventDefault();
    const sourceTask = JSON.parse(e.dataTransfer.getData('text/plain'));
   
    // Adjust the target time by adding one hour (60 minutes)
    const [hours, minutes] = targetTime.split(':').map(Number);
    const adjustedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
   
    if (sourceTask.date !== targetDate || sourceTask.startTime !== adjustedTime) {
      const updatedSourceTask = { ...sourceTask, date: targetDate, startTime: adjustedTime };
     
      // Calculate the end time of the moved task
      const sourceEndTime = new Date(`2000-01-01T${adjustedTime}`);
      sourceEndTime.setMinutes(sourceEndTime.getMinutes() + updatedSourceTask.duration);
      const sourceEndTimeString = sourceEndTime.toTimeString().slice(0, 5);


      // Find tasks that might need to be moved
      const tasksToCheck = tasks.filter(task =>
        task.date === targetDate &&
        task.id !== sourceTask.id &&
        task.startTime >= adjustedTime
      ).sort((a, b) => a.startTime.localeCompare(b.startTime));


      const updatedTasks = [updatedSourceTask];
      let currentEndTime = sourceEndTime;


      tasksToCheck.forEach(task => {
        const taskStartTime = new Date(`2000-01-01T${task.startTime}`);
        if (taskStartTime < currentEndTime) {
          // This task needs to be moved
          const newStartTime = currentEndTime.toTimeString().slice(0, 5);
          const updatedTask = { ...task, startTime: newStartTime };
          updatedTasks.push(updatedTask);


          // Update currentEndTime for the next iteration
          currentEndTime = new Date(`2000-01-01T${newStartTime}`);
          currentEndTime.setMinutes(currentEndTime.getMinutes() + task.duration);
        } else {
          // This task doesn't need to be moved
          updatedTasks.push(task);
          currentEndTime = new Date(`2000-01-01T${task.startTime}`);
          currentEndTime.setMinutes(currentEndTime.getMinutes() + task.duration);
        }
      });


      // Update all affected tasks
      updatedTasks.forEach(task => {
        console.log('Updating task:', task.id, task);
        updateTask(task.id, task);
      });
    }
  };


  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }



  const formatDate = (date) => {
    const options = {
      month: 'short',
    const options = {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    };
    return date.toLocaleDateString('en-US', options);
  }

  const hourHeight = 60; // Height of each hour slot in pixels
  const hourHeight = 60; // Height of each hour slot in pixels
  return (
    <div className="timetable">
      <button className="nav-button prev" onClick={goToPreviousWeek}>
        <span className="arrow-icon">&gt;</span>
      </button>
      <div className="timetable-grid" style={{ paddingTop: '60px' }}> {/* Add padding to shift everything down */}
      <button className="nav-button prev" onClick={goToPreviousWeek}>
        <span className="arrow-icon">&gt;</span>
      </button>
      <div className="timetable-grid" style={{ paddingTop: '60px' }}> {/* Add padding to shift everything down */}
        <div className="time-column">
          <div className="day-header" style={{ height: '60px' }}></div> {/* Increase height of day header */}
          <div className="day-header" style={{ height: '60px' }}></div> {/* Increase height of day header */}
          {timeSlots.map((time) => (
            <div key={time} className="time-slot" style={{ height: `${hourHeight}px` }}>{time}</div>
            <div key={time} className="time-slot" style={{ height: `${hourHeight}px` }}>{time}</div>
          ))}
        </div>
        {visibleDates.map((date) => {
        {visibleDates.map((date) => {
          const dayOfWeek = daysOfWeek[date.getDay()]
          const formattedDate = date.toISOString().split('T')[0]
          return (
            <div key={formattedDate} className="day-column">
              <div className="day-header" style={{ height: '60px' }}> {/* Increase height of day header */}
              <div className="day-header" style={{ height: '60px' }}> {/* Increase height of day header */}
                <div className="day-name">{dayOfWeek}</div>
                <div className="day-date">{formatDate(date)}</div>
              </div>
              <div className="day-tasks">
                {timeSlots.map((time) => (
                  <div
                    key={`${formattedDate}-${time}`}
                    className="time-slot"
                    style={{ height: `${hourHeight}px` }}
                    style={{ height: `${hourHeight}px` }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleMove(e, formattedDate, time)}
                  ></div>
                ))}
                {tasks
                  .filter((task) => {
                    return task.date === formattedDate
                  })
                  .filter((task) => {
                    return task.date === formattedDate
                  })
                  .map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onDelete={handleDelete}
                      onMove={handleMove}
                      timeRange={timeRange}
                      onClick={handleTaskClick}
                      hourHeight={hourHeight}
                      hourHeight={hourHeight}
                    />
                  ))}
              </div>
            </div>
          )
        })}
      </div>
      <button className="nav-button next" onClick={goToNextWeek}>
        <span className="arrow-icon">&gt;</span>
      </button>
      <button className="nav-button next" onClick={goToNextWeek}>
        <span className="arrow-icon">&gt;</span>
      </button>
      <TaskModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onDelete={handleDelete}
      />
    </div>
  )
}



export default Timetable
