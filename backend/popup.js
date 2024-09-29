document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM content loaded');

  const startButton = document.getElementById('startListening');
  const output = document.getElementById('output');
  const taskList = document.getElementById('taskList');
  let recognition;
  let wakeWordRecognition;

  // Function to start the main recognition process
  function startMainRecognition() {
    if ('webkitSpeechRecognition' in window) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = function() {
        speakMessage("What's up cutie patootie?")
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

      console.log('API Key retrieved:', apiKey); // Log API key retrieval

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
                I'm currently in making a timetable ai application that communicates with chatgpt api with the tasks I need to get done and a list of habits I have (e.g. if I usually am really sleepy in the morning, then you shouldn't assignment any difficult task in the morning unless you have to, or I usually work the most efficient between 3 pm to 5pm, then you should assign the most difficult tasks in that time). Please read my list of habits and my tasks I need to do and respond with actions of add, update, or delete depending on the user input to create a timetable. If the action is add, then it should return a json file in the format of Respond with JSON on[{"action":"add",”event":{"id":"","title":"","starttime":"","endtime":"","location":"","description":"","reminder":"","date":"","duration":"",focus":"","moveable":""}}]. If the action is move, then it should return a JSON response in the format of [{"action":"update", "event": {"id":"","title":"","starttime":"","endtime":"","location":"","description":"","reminder":"","date":"","duration":"",focus":"","moveable":""}}]. If the action is delete, then it should return a json formated response in the format of [{"action":"delete", "event": {"id":""}}]. It is okay to give more than one actions in one response if you see fit. For example, you can send back a JSON list of both move and add if you want to add a difficult task into a time the user is more productive in and move the less difficult task that used to be assigned during that time to another freed up time zone. You should have full judgement to see what events should be assigned at what time and whether it is appropriate to shift events around to fit the user's habits. You should evaluate the difficulty and nature of each task and match them with the user's habits. In your response, please add the start_time and end_time that you see fit, if location is not specified, then just output None for location, if the amount of minutes beforehand for the reminder is not specificied, then just default to 5 minutes. Please also give it a short and appropriate event name. Please evaluate how long it should take for each activity. For example, buying groceries would take 30 minutes to account for the traveling time costs, and studying for a final exam should be multiple sessions with breaks in the middle and the sum of these sessions shouldn't be too long so that it will burn the student out. Please think about many factors and result in a time cost to complete each activity. You should also assign a boolean value to Is_Focus depending on whether the activity is studying or not. For example, going to the supermarket would have a false value while studying for a quiz would be a true value. You should also assign a boolean value to Moveable, where you would analyse whether an activity is flexible to move or not. For example, an exam would not be moveable, a date wouldn’t be moveable, but breaks and studying periods would be moveable. Please also listen for any habits from the user that is related to making a time table. For example, a user saying he is most efficient at a certain time range is useful while a user saying he likes banana is not useful. When appropriate, also return JSON formated data in the format of [..., {"action":"Add_Habit", "Habit":""}]. If the user wishes to remove a habit, then it should return JSON in the format of [...,{"action": "Remove_Habit", "Habit":""}] where the Habit parameter holds existing habit to delete from the existing habit list.
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
              output.textContent = JSON.stringify(events, null, 2);
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
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Backend response:', data);  // Log the response from backend
      if (data.success) {
        output.textContent = 'Events inserted successfully!';
        // fetchChatGPTResponse('success');  // Get a success phrase from ChatGPT
        // Schedule reminders for the events (assuming scheduleReminders is defined elsewhere)
        scheduleReminders(events);
        fetchAndDisplayTasks(); // Refresh the task list
      } else {
        console.error('Backend Error:', data.message);
        output.textContent = 'Error inserting events: ' + data.message;
        output.textContent = error;
        // fetchChatGPTResponse('failure');  // Get a failure phrase from ChatGPT
      }
    })
    .catch(error => {
      console.error('Error inserting events:', error);
      output.textContent = 'Error inserting events.';
      fetchChatGPTResponse('failure');
    });
  }
  
  // Function to fetch personalized responses from ChatGPT using OpenAI API
  function fetchChatGPTResponse(status) {
    let prompt;
  
    // Set the appropriate prompt based on the status
    if (status === 'success') {
      prompt = "Give me a fun, encouraging message to celebrate a successful event insertion.";
    } else if (status === 'failure') {
      prompt = "Provide a gentle, understanding message for when an event insertion fails.";
    }
  
    // Make the API request to GPT-4
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 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`
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
  
  const blockButton = document.getElementById('blockYouTubeAndCloseTabs');

  console.log('Block button:', blockButton);

  if (blockButton) {
    console.log('Adding click event listener to block button');
    blockButton.addEventListener('click', function() {
      console.log('Block button clicked');

      // Close all YouTube tabs
      chrome.tabs.query({ url: '://.youtube.com/*' }, function(tabs) {
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
  document.addEventListener('DOMContentLoaded', fetchAndDisplayTasks);
  
});


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