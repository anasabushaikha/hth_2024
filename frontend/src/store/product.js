import { create } from 'zustand'

const generateId = () => Math.random().toString(36).substr(2, 9)

const initialTasks = [
  { id: generateId(), title: 'Weekend Brunch', duration: 90, startTime: '10:30', date: '2024-09-28' },
  { id: generateId(), title: 'Grocery Shopping', duration: 60, startTime: '14:00', date: '2024-09-28' },
  { id: generateId(), title: 'Movie Night', duration: 120, startTime: '20:00', date: '2024-09-28' },
  { id: generateId(), title: 'Morning Jog', duration: 45, startTime: '07:00', date: '2024-09-29' },
  { id: generateId(), title: 'Family Lunch', duration: 120, startTime: '13:00', date: '2024-09-29' },
  { id: generateId(), title: 'Book Club Meeting', duration: 90, startTime: '18:30', date: '2024-09-29' },
  { id: generateId(), title: 'Team Standup', duration: 30, startTime: '09:00', date: '2024-09-30' },
  { id: generateId(), title: 'Project Presentation', duration: 60, startTime: '14:00', date: '2024-09-30' },
  { id: generateId(), title: 'Yoga Class', duration: 75, startTime: '18:00', date: '2024-09-30' },
  { id: generateId(), title: 'Dentist Appointment', duration: 60, startTime: '11:00', date: '2024-10-01' },
  { id: generateId(), title: 'Lunch with Client', duration: 90, startTime: '13:30', date: '2024-10-01' },
  { id: generateId(), title: 'Evening Webinar', duration: 120, startTime: '19:00', date: '2024-10-01' },
  { id: generateId(), title: 'Gym Session', duration: 60, startTime: '07:30', date: '2024-10-02' },
  { id: generateId(), title: 'Team Building Activity', duration: 180, startTime: '13:00', date: '2024-10-02' },
  { id: generateId(), title: 'Online Course', duration: 90, startTime: '20:00', date: '2024-10-02' },
  { id: generateId(), title: 'Quarterly Review', duration: 120, startTime: '10:00', date: '2024-10-03' },
  { id: generateId(), title: 'Lunch Break', duration: 60, startTime: '13:00', date: '2024-10-03' },
  { id: generateId(), title: 'Happy Hour with Colleagues', duration: 120, startTime: '18:00', date: '2024-10-03' },
  { id: generateId(), title: 'Morning Meditation', duration: 30, startTime: '07:00', date: '2024-10-04' },
  { id: generateId(), title: 'Project Deadline', duration: 240, startTime: '09:00', date: '2024-10-04' },
  { id: generateId(), title: 'Farewell Party', duration: 180, startTime: '18:00', date: '2024-10-04' }
]

const useTaskStore = create((set) => ({
  tasks: initialTasks,
  setTasks: (tasks) => set({ tasks }),
  addTask: (newTask) => {
    const taskWithId = { ...newTask, id: generateId() }
    set((state) => ({
      tasks: [...state.tasks, taskWithId],
    }))
    return { success: true, message: 'Task added successfully' }
  },
  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }))
    return { success: true, message: 'Task deleted successfully' }
  },
  updateTask: (taskId, updatedTask) => {
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, ...updatedTask } : task)),
    }))
    return { success: true, message: 'Task updated successfully' }
  },
}))

export default useTaskStore