document.addEventListener('DOMContentLoaded', function() {
  const output = document.getElementById('output');
  let recognition;
  let wakeWordRecognition;
  const upcomingEventsList = document.getElementById('upcomingEventsList');
 
 
  // Function to fetch and display upcoming events
  function fetchAndDisplayUpcomingEvents() {
    fetch('http://localhost:3000/upcomingEvents')  // Correct endpoint
      .then(response => {
        console.log('Response:', response);  // Log the response
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Data:', data);  // Log the data
        upcomingEventsList.innerHTML = ''; // Clear the list
 
 
        if (data.success) {
          const events = data.events;
 
 
          if (events.length === 0) {
            upcomingEventsList.innerHTML = '<li>No upcoming events.</li>';
          } else {
            events.forEach(event => {
              const listItem = document.createElement('li');
              listItem.textContent = `${event.title} at ${event.start_time}`;
              upcomingEventsList.appendChild(listItem);
            });
          }
        } else {
          console.error('Error fetching upcoming events:', data.message);
          upcomingEventsList.innerHTML = '<li>Error fetching upcoming events.</li>';
        }
      })
      .catch(error => {
        console.error('Error fetching upcoming events:', error);
        upcomingEventsList.innerHTML = '<li>Error fetching upcoming events.</li>';
      });
  }
 
 
  // Call the function to fetch and display upcoming events
  fetchAndDisplayUpcomingEvents();
 
 
 
 
 
 
  // Function to start the main recognition process
  function startMainRecognition() {
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
 
 
      recognition.onend = function() {
        // Restart the wake word recognition after the main recognition ends
        startWakeWordRecognition();
      };
 
 
      recognition.start();
    } else {
      output.textContent = 'Web Speech API is not supported in this browser.';
    }
  }
 
 
  // Function to start listening for the wake word "Hey Mommy"
  function startWakeWordRecognition() {
    if ('webkitSpeechRecognition' in window) {
      wakeWordRecognition = new webkitSpeechRecognition();
      wakeWordRecognition.continuous = true;
      wakeWordRecognition.interimResults = false;
      wakeWordRecognition.lang = 'en-US';
 
 
      wakeWordRecognition.onstart = function() {
        output.textContent = 'Listening for wake word...';
      };
 
 
      wakeWordRecognition.onresult = function(event) {
        const wakeWord = event.results[0][0].transcript.trim().toLowerCase();
 
 
        if (wakeWord === 'hey mommy') {
          output.textContent = 'Wake word detected: "Hey Mommy"';
 
 
          // Stop wake word recognition and start the main recognition
          wakeWordRecognition.stop();
          startMainRecognition();
        }
      };
 
 
      wakeWordRecognition.onerror = function(event) {
        output.textContent = 'Error occurred in wake word recognition: ' + event.error;
      };
 
 
      wakeWordRecognition.start();
    } else {
      output.textContent = 'Web Speech API is not supported in this browser.';
    }
  }
 
 
  // Call this function initially to start listening for the wake word
  startWakeWordRecognition();
 
 
  function processCommand(command) {
    chrome.storage.local.get(['openaiApiKey'], function(result) {
      const apiKey = result.openaiApiKey;
      if (!apiKey) {
        alert('Please set your OpenAI API key in the extension options.');
        output.textContent = 'API key not set.';
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
              content: `
                You are an assistant that organizes a daily schedule into calendar events based on the user's habits and task list. Analyze the difficulty and nature of tasks and assign them to appropriate times based on the user's productivity habits. Use the following logic for actions:
                - If adding a new event, return JSON in the format [{"action":"add", "event": {"id":"", "title": "", "day": "", "start_time": "", "end_time": "", "location": "", "description": "", "reminder": "5", "focus": "", "moveable": ""}}].
                - If moving an event, return JSON in the format [{"action":"update", "event": {"id":"", "title": "", "day": "", "start_time": "", "end_time": "", "location": "", "description": "", "reminder": "5", "focus": "", "moveable": ""}}].
                - If deleting an event, return JSON in the format [{"action":"delete", "event": {"id":""}}].
                Evaluate time, focus, and moveability for each task. Assign a time cost, default location as "None", and reminder as 5 minutes if not specified.
              `
            },
            {
              role: 'user',
              content: `Here’s my schedule: ${command}. Respond with JSON only. No extra text.`
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
            //output.textContent = 'Error parsing JSON response.';
          }
        }
      })
      .catch(error => {
        console.error('Fetch Error:', error);
        // output.textContent = 'Error communicating with the AI service.';
      });
    });
  }
 
 
  function insertEventsIntoDatabase(events) {
    events.forEach(event => {
      // Check if the date is valid and can be parsed
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
        // output.textContent = 'Events inserted successfully!';
        speakMessage('You sexy beast! Events have been inserted successfully! Good job, sweetheart!');
      } else {
        // output.textContent = 'Error inserting events: ' + data.message;
        speakMessage('There was an error inserting the events. Try again later, dear.');
      }
    })
    .catch(error => {
      console.error('Error inserting events:', error);
      // output.textContent = 'Error inserting events.';
      speakMessage('There was an error inserting the events, honey. Please check the issue.');
    });
  }
   // Function to handle speaking the message
  // Function to handle speaking the message using OpenAI TTS (Node.js backend)
  function speakMessage(message) {
    fetch('http://localhost:3000/generateSpeech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),  // Send the message to the backend
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error generating speech');
        }
        return response.blob();  // Get the audio as a Blob
      })
      .then(audioBlob => {
        // Create an audio element and play the audio
        const audioURL = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioURL);
        audio.play();
      })
      .catch(error => {
        console.error('Error fetching audio:', error);
      });
  }
 
 
  });
 