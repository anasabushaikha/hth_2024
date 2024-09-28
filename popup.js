document.addEventListener('DOMContentLoaded', function() {
  const startButton = document.getElementById('startListening');
  const output = document.getElementById('output');
  const taskList = document.getElementById('taskList');
  let recognition;

  startButton.addEventListener('click', function() {
    if ('webkitSpeechRecognition' in window) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = function() {
        output.textContent = 'Listening...';
      };

      recognition.onresult = function(event) {
        const spokenText = event.results[0][0].transcript;
        output.textContent = 'Processing command...';

        // Pass the spoken text directly to ChatGPT
        processCommand(spokenText);
      };

      recognition.onerror = function(event) {
        output.textContent = 'Error occurred in recognition: ' + event.error;
      };

      recognition.start();
    } else {
      output.textContent = 'Web Speech API is not supported in this browser.';
    }
  });

  function processCommand(command) {
    // Disable the start button to prevent multiple clicks
    startButton.disabled = true;

    chrome.storage.local.get(['openaiApiKey'], function(result) {
      const apiKey = result.openaiApiKey;
      if (!apiKey) {
        alert('Please set your OpenAI API key in the extension options.');
        output.textContent = 'API key not set.';
        startButton.disabled = false;
        return;
      }

      // Proceed with the API call if the API key exists
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an assistant that responds to any input with helpful and informative responses.'
            },
            {
              role: 'user',
              content: `Interpret this command: "${command}"`
            }
          ],
          max_tokens: 150, // Can be adjusted based on desired response length
          temperature: 0.7 // Adjust temperature to control randomness of the response
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error('OpenAI API Error:', data.error);
          output.textContent = 'Error processing the command.';
        } else {
          const aiResponse = data.choices[0].message.content.trim();
          output.textContent = 'Response: ' + aiResponse;
        }
      })
      .catch(error => {
        console.error('Fetch Error:', error);
        output.textContent = 'Error communicating with the AI service.';
      })
      .finally(() => {
        startButton.disabled = false;
      });
    });
  }

  // Optional: Updating task list if you still want to store tasks
  function saveTask(task) {
    chrome.storage.sync.get(['tasks'], function(result) {
      let tasks = result.tasks || [];
      tasks.push(task);
      chrome.storage.sync.set({ tasks: tasks }, function() {
        updateTaskList();
      });
    });
  }

  function addTaskToList(task) {
    const li = document.createElement('li');
    li.textContent = task;
    taskList.appendChild(li);
  }

  function updateTaskList() {
    chrome.storage.sync.get(['tasks'], function(result) {
      const tasks = result.tasks || [];
      taskList.innerHTML = '';
      tasks.forEach(function(task) {
        const li = document.createElement('li');
        li.textContent = task;
        taskList.appendChild(li);
      });
    });
  }

  updateTaskList();
});
