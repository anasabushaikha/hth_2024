 
import { create } from 'zustand';
import { useEffect } from 'react';
import axios from 'axios';
 
const generateId = () => Math.random().toString(36).substr(2, 9);
 
const useTaskStore = create((set) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: (newTask) => {
    const taskWithId = { ...newTask, id: generateId() };
    set((state) => ({
      tasks: [...state.tasks, taskWithId],
    }));
    return { success: true, message: 'Task added successfully' };
  },
  deleteTask: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }));
    return { success: true, message: 'Task deleted successfully' };
  },
  updateTask: (taskId, updatedTask) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      ),
    }));
    return { success: true, message: 'Task updated successfully' };
  },
}));
 
// Custom hook to fetch tasks from the server
export const useFetchTasks = () => {
  const { setTasks } = useTaskStore();
 
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:3000/getEvents');
       
        const fetchedEvents = response.data.map((event) => ({
          id: generateId(),  // Generate a new ID for each event
          title: event.event_title,
          duration: event.end_time - event.start_time,  // Assuming you need to calculate duration
          startTime: event.start_time,
          date: event.event_day,
        }));
        console.log(fetchedEvents)
        setTasks(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
 
    fetchTasks();
  }, [setTasks]);
};
 
export default useTaskStore;
 
 
 
 