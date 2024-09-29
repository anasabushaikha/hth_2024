import { create } from 'zustand';
import { useEffect } from 'react';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useTaskStore = create((set) => {
  console.log('Initializing useTaskStore');
  return {
    tasks: [],
    setTasks: (tasks) => {
      set({ tasks });
    },
    addTask: (newTask) => {
      const taskWithId = { ...newTask, id: generateId() };
      set((state) => {
        const newTasks = [...state.tasks, taskWithId];
        return { tasks: newTasks };
      });
      return { success: true, message: 'Task added successfully' };
    },
    deleteTask: (taskId) => {
      set((state) => {
        const newTasks = state.tasks.filter((task) => task.id !== taskId);
        return { tasks: newTasks };
      });
      return { success: true, message: 'Task deleted successfully' };
    },
    updateTask: (taskId, updatedTask) => {
      console.log('Task ID: ', taskId);
      set((state) => {
        const newTasks = state.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updatedTask } : task
        );
        console.log('New state after update:', newTasks);
        return { tasks: newTasks };
      });

      console.log('State after set:', useTaskStore.getState().tasks);
      return { success: true, message: 'Task updated successfully' };
    },
  };
});

// Custom hook to fetch tasks (without using axios)
export const useFetchTasks = () => {
  const { tasks, setTasks } = useTaskStore();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Here, you'd replace this with your own logic to fetch tasks, 
        // such as using `fetch` or other methods to get the data.
        const mockResponse = [
          {
            id: '1',
            title: 'Task 1',
            duration: 120,
            starttime: '10:00',
            date: '2023-09-29',
          },
          {
            id: '2',
            title: 'Task 2',
            duration: 60,
            starttime: '12:00',
            date: '2023-09-30',
          },
        ];

        const fetchedEvents = mockResponse.map((event) => ({
          id: event.id,
          title: event.title || 'Untitled', // Ensure title is a string
          duration: event.duration || 0, // Ensure duration is a number
          startTime: event.starttime || '00:00', // Ensure startTime is formatted correctly
          date: new Date(event.date).toISOString().split('T')[0], // Handle date parsing
        }));

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
