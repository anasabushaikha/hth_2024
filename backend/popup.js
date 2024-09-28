document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM content loaded');

  const startButton = document.getElementById('startListening');
  const output = document.getElementById('output');
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

        // Check for the test command
        if (spokenText.toLowerCase() === 'test reminder') {
          insertTestEvent();
        } else {
          // Pass the spoken text directly to ChatGPT
          processCommand(spokenText);
        }
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
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an assistant that organizes a daily schedule into calendar events. Return the response as JSON only, without any human text, in the following format: [{"Event Title": "", "Day": "YYYY-MM-DD", "StartTime": "", "EndTime": "", "Location": "", "Description": "", "Reminder": ""}].'
            },
            {
              role: 'user',
              content: `Here’s my schedule: ${command}. Respond with JSON only. No extra text. The format is [{"Event Title": "", "Day": "YYYY-MM-DD", "StartTime": "", "EndTime": "", "Location": "", "Description": "", "Reminder": ""}].`
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

              output.textContent = JSON.stringify(events, null, 2);
              
              insertEventsIntoDatabase(events);
            } else {
              throw new Error('No JSON found in the response');
            }
          } catch (error) {
            console.error('JSON Parse Error:', error);
            output.textContent = error;
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

  function insertEventsIntoDatabase(events) {
    events.forEach(event => {
      const parsedDate = new Date(event["Day"]);
      if (isNaN(parsedDate.getTime())) {
        console.error(`Invalid date format: ${event["Day"]}`);
        event["Day"] = null;  // Set to null or handle as needed
      } else {
        event["Day"] = parsedDate.toISOString().split('T')[0];  // Format as YYYY-MM-DD
      }
    });
  
    fetch('http://localhost:3000/insertEvents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),  // Send the events data to the backend
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        output.textContent = 'Events inserted successfully!';
        // Schedule reminders for the events
        scheduleReminders(events);
      } else {
        output.textContent = 'Error inserting events: ' + data.message;
      }
    })
    .catch(error => {
      console.error('Error inserting events:', error);
      output.textContent = 'Error inserting events.';
    });
  }

  const blockButton = document.getElementById('blockYouTubeAndCloseTabs');

  console.log('Block button:', blockButton);

  if (blockButton) {
    console.log('Adding click event listener to block button');
    blockButton.addEventListener('click', function() {
      console.log('Block button clicked');

      // Close all YouTube tabs
      chrome.tabs.query({ url: '*://*.youtube.com/*' }, function(tabs) {
        console.log('YouTube tabs found:', tabs.length);
        tabs.forEach(function(tab) {
          chrome.tabs.remove(tab.id);
        });
      });

      // Send message to background script to block YouTube
      chrome.runtime.sendMessage({ action: 'blockYouTube' }, function(response) {
        if (response && response.success) {
          console.log('YouTube blocked successfully');
        } else {
          console.error('Failed to block YouTube', response);
        }
      });
    });
  } else {
    console.error('Block button or duration select not found');
  }

  // Call the function when the popup is opened
  document.addEventListener('DOMContentLoaded', fetchAndDisplayTasks);
});