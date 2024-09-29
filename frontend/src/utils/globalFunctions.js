let globalAIHandler = null;

export const setGlobalAIHandler = (handler) => {
  globalAIHandler = handler;
};

export const triggerGlobalAIHandler = (action) => {
  if (globalAIHandler) {
    console.log(`Global AI Handler called with action: ${action}`);
    globalAIHandler(action);
    if (action[0].action === 'add') {
      setTimeout(() => addFancyAnimationToNewTask(), 0);
    }
  } else {
    console.error('Global AI Handler not set');
  }
};

//remember that for this to work you have to make id
const addFancyAnimationToNewTask = () => {
  const tasks = document.querySelectorAll('.task-item');
  console.log(tasks);
  const newTask = tasks[tasks.length - 1]; // Get the last added task
  if (newTask) {
    newTask.classList.add('fancy-new-task');
    newTask.addEventListener('animationend', () => {
      newTask.classList.remove('fancy-new-task');
    });
  }
};