import { create } from 'zustand';
import { useEffect } from 'react';
import axios from 'axios';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useTaskStore = create((set) => ({
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
  const { tasks, setTasks } = useTaskStore();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:3000/getEvents');
       
        const fetchedEvents = response.data.map((event) => ({
          id: event.id,
          title: event.title,
          duration: event.duration,
          startTime: event.starttime,
          date: new Date(event.date).toISOString().split('T')[0], // Convert to ISO string and take the date part
        }));
        console.log(fetchedEvents);
        setTasks(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchTasks();
  }, [setTasks]);

  return tasks;
};

export default useTaskStore;
