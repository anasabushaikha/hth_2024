import React from 'react';
import useTaskStore, { useFetchTasks } from './product';  // Import store and hook

const TaskComponent = () => {
  const tasks = useTaskStore((state) => state.tasks);  // Access tasks from Zustand
  useFetchTasks();  // Fetch tasks from the server when the component mounts

  return (
    <div>
      <h1>Task List</h1>
      {tasks.map((task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.date}</p>
          <p>{task.startTime} - {task.duration} minutes</p>
        </div>
      ))}
    </div>
  );
};

export default TaskComponent;
