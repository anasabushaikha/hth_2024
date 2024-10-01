document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM content loaded');

  const output = document.getElementById('output');
  // const taskList = document.getElementById('taskList');
  let recognition;
  let wakeWordRecognition;
  const upcomingEventsList = document.getElementById('upcomingEventsList');
  const loveMeter = document.getElementById('loveMeter');
  const blockButton = document.getElementById('blockYouTubeAndCloseTabs');

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

          // Sort events by date and time
          events.sort((a, b) => new Date(a.date) - new Date(b.date));

          if (events.length === 0) {
            upcomingEventsList.innerHTML = '<li>No upcoming events.</li>';
          } else {
            events.forEach((event, index) => {
              const listItem = document.createElement('li');
              const formattedDate = new Date(event.date).toLocaleDateString();
             
              // Adjust size based on index (earliest event gets larger size)
              const size = 20 - index; // Adjust size decrementally
              listItem.style.fontSize = `${size > 10 ? size : 10}px`; // Minimum size of 10px

              listItem.innerHTML = `${event.title} in ${event.location} at ${event.endtime} on ${formattedDate}
                <div class="event-actions">
                  <button class="tickMark" data-id="${event.id}">✔️</button>
                  <button class="crossMark" data-id="${event.id}">❌</button>
                </div>`;
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
      // fetchChatGPTResponse('greetings')
      speakMessage("Whats up cutie patootie?")
      output.textContent = 'Listening...';
     
    };


    recognition.onresult = function(event) {
      const spokenText = event.results[0][0].transcript;
      output.textContent = 'Processing command...';


      // Check for the test command
      if (spokenText.toLowerCase() === 'test reminder') {
        insertTestEvent(); // Assuming insertTestEvent is defined elsewhere
      } else {
        // Pass the spoken text directly to ChatGPT
        processCommand(spokenText);
      }
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


      if (wakeWord === 'hey sweetie') {
        output.textContent = 'Wake word detected: "Hey Sweetie"';


        // Stop wake word recognition and start the main recognition
        wakeWordRecognition.stop();
        startMainRecognition();
      }
    };


    wakeWordRecognition.onerror = function(event) {
      // output.textContent = 'Error occurred in wake word recognition: ' + event.error;
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


    console.log('API Key retrieved:', apiKey); // Log API key retrieval


    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': ""
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `
              You are an assistant that organizes a daily schedule into calendar events based on the user's habits and task list. Analyze the difficulty and nature of tasks and assign them to appropriate times based on the user's productivity habits. Use the following logic for actions:
              - If adding a new event, return JSON in the format [{"action":"add", "event": {"id":"", "title": "", "date": "YYYY-MM-DD", "starttime": "", "endtime": "", "location": "", "description": "", "reminder": "5", "focus": "", "moveable": "", "duration": ""}}]. Date can be today or tomorrow, in which case date will be string "Today" or string "Tomorrow"
              - If moving an event, return JSON in the format [{"action":"update", "event": {"id":"", "title": "", "date": "YYYY-MM-DD", "starttime": "", "endtime": "", "location": "", "description": "", "reminder": "5", "focus": "", "moveable": "", "duration": ""}}].Date can be today or tomorrow, in which case date will be string "Today" or string "Tomorrow"
              - If deleting an event, return JSON in the format [{"action":"delete", "event": {"id":""}}].
              Evaluate time, focus, and moveability for each task. Assign a time cost, default location as "None", and reminder as 5 minutes if not specified. Date can be specified as "Today" or "Tomorrow" so get the date accordingly for the date attribute of the event JSON
              If "duration" is not provided, calculate it as the difference between the "endtime" and "starttime".
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
    .then(response => {
      console.log('API response status:', response.status); // Log response status
      return response.json();
    })
    .then(data => {
      console.log('API response data:', data); // Log response data
      if (data.error) {
        console.error('OpenAI API Error:', data.error);
        // output.textContent = 'Error processing the command.';
      } else {
        const aiResponse = data.choices[0].message.content.trim();


        // Try to sanitize and parse the response to ensure valid JSON
        try {
          const jsonStart = aiResponse.indexOf('[');
          const jsonEnd = aiResponse.lastIndexOf(']') + 1;


          if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonResponse = aiResponse.substring(jsonStart, jsonEnd);
            const events = JSON.parse(jsonResponse);  // Parse the JSON response


            insertEventsIntoDatabase(events);
            output.textContent = JSON.stringify(events, null, 2);
          } else {
            throw new Error('No JSON found in the response');
          }
        } catch (error) {
          console.error('JSON Parse Error:', error);
          // output.textContent = error;
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
    if (event["event"]["date"]) {
      const parsedDate = new Date(event["event"]["date"]);
      if (isNaN(parsedDate.getTime())) {
        console.error(`Invalid date format: ${event["event"]["date"]}`);
        event["event"]["date"] = null;  // Set to null or handle as needed
      } else {
        event["event"]["date"] = parsedDate.toISOString().split('T')[0];  // Format as YYYY-MM-DD
      }
    }
     // Check if the title exists
    if (!event["event"]["title"]) {
      console.error("Title is missing for an event. Skipping insertion.");
      return; // Skip if title is missing
    }
  });
   fetch('http://localhost:3000/insertEvents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ events }),  // Send the events data to the backend
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    console.log('Backend response:', data);
    if (data.success) {
      // output.textContent = 'Events inserted successfully!';
      fetchChatGPTResponse('success')
    } else {
      console.error('Backend Error:', data.message);
      // output.textContent = 'Error inserting events: ' + data.message;
      fetchChatGPTResponse('failure')
    }
  })
  .catch(error => {
    console.error('Error inserting events:', error);
    // output.textContent = 'Error inserting events.';
  });
}

// Function to fetch personalized responses from ChatGPT using OpenAI API
function fetchChatGPTResponse(status) {
  let prompt;
   // Set the appropriate prompt based on the status
  if (status === 'success') {
    prompt = "Give me a fun, max 12 words encouraging message to celebrate a successful event insertion.";
  } else if (status === 'failure') {
    prompt = "Provide a gentle, max 12 words, understanding message for when an event insertion fails.";
  } else if (status === 'greetings'){
    prompt = "Give me a concise whats up that is somewhat flirty, it comes after I call you Hey Sweetie so say something like hey whats up etc"
  }
   // Make the API request to GPT-4
  fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer sk-j1FWLZYG2O2QOZBzy-vp2RSxuEAEdpopi9DEKAgVtiT3BlbkFJnW6T6_jc-n9R8O2uRX5oSNJgOmeuNkR_dnvTgWBO8A`
    },
    body: JSON.stringify({
      model: 'gpt-4', // Ensure correct model is used
      messages: [
        { role: 'system', content: 'You are a helpful assistant that gives concise but somewhat flirty status updates based on events being added or removed.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 50 // Limiting the response to 50 tokens
    })
  })
  .then(response => response.json())
  .then(data => {
    const message = data.choices[0].message.content.trim(); // Fetch the message from the response
    speakMessage(message); // Call speakMessage with the generated response
  })
  .catch(error => {
    console.error('Error fetching ChatGPT response:', error);
    speakMessage("I'm sorry, there was an error retrieving the message."); // Fallback message in case of an error
  });
}

// Function to handle speaking the message
function speakMessage(message) {
  console.log("Im about to speak")
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





  // Function to delete an event
  async function deleteEvent(eventId) {
    try {
      const response = await fetch(`http://localhost:3000/deleteEvent/${eventId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        speakMessage('Event deleted successfully.');
      } else {
        speakMessage('Error deleting event: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      speakMessage('Error deleting event.');
    }
  }

  // Function to update the love meter
  function updateLoveMeter(change) {
    let currentValue = parseInt(loveMeter.value);
    currentValue = Math.max(0, Math.min(100, currentValue + change)); // Ensure value stays between 0 and 100
    loveMeter.value = currentValue;
  }

  // Event delegation for tick and cross marks
  document.addEventListener('click', async function(event) {
    if (event.target.classList.contains('tickMark')) {
      const eventId = event.target.getAttribute('data-id');
      const userConfirmed = confirm('Are you sure you want to delete this event? Ok or Cancel');
      if (userConfirmed) {
        await deleteEvent(eventId);
        updateLoveMeter(10); // Increase love meter by 10
        fetchAndDisplayUpcomingEvents(); // Refresh events after deletion
      } else {
        speakMessage('Event deletion canceled.');
      }
    }

    if (event.target.classList.contains('crossMark')) {
      const eventId = event.target.getAttribute('data-id');
      const userConfirmed = confirm('Punishment has been triggered!!!');
      if (userConfirmed) {
        await deleteEvent(eventId);
        updateLoveMeter(-10); // Decrease love meter by 10
        fetchAndDisplayUpcomingEvents(); // Refresh events after deletion
      } else {
        alert('Punishment canceled.');
      }
    }
  });

  // YouTube blocking functionality
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
});
