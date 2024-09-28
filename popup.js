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
  
          // Process the spoken text with AI
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
                content: `You are an assistant that interprets user voice commands in a Chrome extension and outputs a JSON object with an action and parameters. Supported actions include:
                  - "add_task": Add a new task. Parameters: "task" (string).
                  - "open_url": Open a new browser tab with a specified URL. Parameters: "url" (string).
                  - "search": Perform a Google search with a specified query. Parameters: "query" (string).
                  - "unknown": If the command is not recognized.
      
                  Respond only with a JSON object. Do not include any extra text.`
              },
              {
                role: 'user',
                content: `Interpret this command: "${command}"`
              }
            ],
            max_tokens: 100,
            temperature: 0
          })
        })
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            console.error('OpenAI API Error:', data.error);
            output.textContent = 'Error processing the command.';
          } else {
            const aiResponse = data.choices[0].message.content.trim();
            handleAIResponse(aiResponse);
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
  
    function handleAIResponse(response) {
      try {
        const actionObj = JSON.parse(response);
  
        switch (actionObj.action) {
          case 'add_task':
            const task = actionObj.parameters.task;
            saveTask(task);
            addTaskToList(task);
            output.textContent = 'Task added: ' + task;
            break;
          case 'open_url':
            const url = actionObj.parameters.url;
            chrome.tabs.create({ url: url });
            output.textContent = 'Opening URL: ' + url;
            break;
          case 'search':
            const query = actionObj.parameters.query;
            const searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(query);
            chrome.tabs.create({ url: searchUrl });
            output.textContent = 'Searching for: ' + query;
            break;
          default:
            output.textContent = 'Command not recognized.';
        }
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        output.textContent = 'Error interpreting the command.';
      }
    }
  
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
  