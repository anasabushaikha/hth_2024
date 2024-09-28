// Listen for the task details from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'loadTask') {
        displayTaskDetails(message.task);
    }
});

function displayTaskDetails(task) {
    const taskDetailsElement = document.getElementById('taskDetails');
    taskDetailsElement.innerHTML = `
        <h2>${task.title}</h2>
        <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
        <p><strong>Day:</strong> ${task.Day || 'No date set'}</p>
        <p><strong>Start Time:</strong> ${task.StartTime || 'Not specified'}</p>
        <p><strong>End Time:</strong> ${task.EndTime || 'Not specified'}</p>
        <p><strong>Location:</strong> ${task.Location || 'No location set'}</p>
        <p><strong>Reminder:</strong> ${task.Reminder || 'No reminder set'}</p>
    `;
}

// In case the task ID is passed via URL parameters
const urlParams = new URLSearchParams(window.location.search);
const taskId = urlParams.get('id');
if (taskId) {
    // You might want to fetch task details here if not sent via message
    // For example:
    // chrome.runtime.sendMessage({ action: 'getTaskDetails', taskId: taskId }, displayTaskDetails);
}