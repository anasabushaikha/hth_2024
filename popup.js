const { Client } = require('pg');

// Create a new instance of the Client for PostgreSQL connection
const client = new Client({
  user: 'your_username', // Replace with your PostgreSQL username
  host: 'localhost', // Since you're connecting to a local PostgreSQL server
  database: 'your_database', // Replace with the name of your PostgreSQL database
  password: 'your_password', // Replace with your PostgreSQL password
  port: 5432, // Default PostgreSQL port
});

client.connect(); // Connect to the PostgreSQL database

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
    startButton.disabled = true;

    chrome.storage.local.get(['openaiApiKey'], function(result) {
      const apiKey = result.openaiApiKey;
      if (!apiKey) {
        alert('Please set your OpenAI API key in the extension options.');
        output.textContent = 'API key not set.';
        startButton.disabled = false;
        return;
      }

      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an assistant that organizes a daily schedule into calendar events. Return the response as JSON only, without any human text, in the following format: [{"Event Title": "", "Day (YYYY-MM-DD)": "", "StartTime": "", "EndTime": "", "Location (string)": "", "Description (string)": "", "Reminder (time)": ""}].'
            },
            {
              role: 'user',
              content: `Here’s my schedule: ${command}. Respond with JSON only. No extra text. The format is [{"Event Title": "", "Day": "", "StartTime": "", "EndTime": "", "Location": "", "Description": "", "Reminder": ""}].`
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          console.error('OpenAI API Error:', data.error);
          output.textContent = 'Error processing the command.';
        } else {
          const aiResponse = data.choices[0].message.content.trim();

          // Try to sanitize and parse the response to ensure valid JSON
          try {
            const jsonStart = aiResponse.indexOf('[');
            const jsonEnd = aiResponse.lastIndexOf(']') + 1;

            if (jsonStart !== -1 && jsonEnd !== -1) {
              const jsonResponse = aiResponse.substring(jsonStart, jsonEnd);
              const events = JSON.parse(jsonResponse);  // Parse the JSON response

              output.textContent = 'Event Suggestions: ' + JSON.stringify(events, null, 2);
              
              // Save events to PostgreSQL
              saveToDatabase(events); // Call function to save JSON response to PostgreSQL
            } else {
              throw new Error('No JSON found in the response');
            }
          } catch (error) {
            console.error('JSON Parse Error:', error);
            output.textContent = 'Error parsing JSON response. Please check the response format.';
          }
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

  // Function to save the parsed events to PostgreSQL
  function saveToDatabase(events) {
    events.forEach(event => {
      const query = `
        INSERT INTO events (title, day, start_time, end_time, location, description, reminder)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      const values = [
        event['Event Title'], 
        event['Day (YYYY-MM-DD)'], 
        event['StartTime'], 
        event['EndTime'], 
        event['Location (string)'], 
        event['Description (string)'], 
        event['Reminder (time)']
      ];

      client.query(query, values, (err, res) => {
        if (err) {
          console.error('Error inserting data into PostgreSQL', err.stack);
        } else {
          console.log('Event inserted into database:', event);
        }
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
