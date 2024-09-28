document.addEventListener('DOMContentLoaded', function () {
  const output = document.getElementById('output');
  let recognition;

  // Initialize Speech Recognition
  if ('webkitSpeechRecognition' in window) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true; // Continuous listening
      recognition.interimResults = false; // Don't show partial results
      recognition.lang = 'en-US';

      recognition.onstart = function () {
          output.textContent = 'Listening... Say "Hey Mommy" to start.';
      };

      recognition.onresult = function (event) {
          // Loop through the results since there could be multiple
          for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                  const spokenText = event.results[i][0].transcript.trim().toLowerCase();

                  // Check if the hotword "Hey Mommy" was spoken
                  if (spokenText.includes('hey mommy')) {
                      output.textContent = 'Hotword detected: Hey Mommy';
                      const command = spokenText.replace('hey mommy', '').trim(); // Get the actual command
                      if (command) {
                          processCommand(command); // Pass command to the AI for processing
                      } else {
                          output.textContent += '\nAwaiting your command...';
                      }
                  }
              }
          }
      };

      recognition.onerror = function (event) {
          console.error('Speech Recognition Error:', event.error);
          output.textContent = 'Error occurred in recognition: ' + event.error;
      };

      // Automatically restart the recognition if it stops
      recognition.onend = function () {
          recognition.start(); // Keep listening even after it stops
      };

      recognition.start(); // Start the recognition right away
  } else {
      output.textContent = 'Web Speech API is not supported in this browser.';
  }

  // Process command as before (use the OpenAI or weather API depending on the command)
  function processCommand(command) {
      // Disable the recognition to prevent overlapping commands
      recognition.stop();
      output.textContent += '\nProcessing your command...';

      // Your previous command handling code here (OpenAI call, weather API, etc.)
      // Example:
      if (command.includes("weather")) {
          fetchWeather(command); // Call the function for weather
      } else {
          // Handle other commands with OpenAI
          processWithOpenAI(command);
      }
  }

  function fetchWeather(command) {
      // Replace this with your OpenWeatherMap API key
      const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
      const cityMatch = command.match(/weather in ([a-zA-Z\s]+)/i);
      const city = cityMatch ? cityMatch[1].trim() : 'Ottawa'; // Default to Ottawa if no city specified

      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
          .then(response => response.json())
          .then(data => {
              if (data.cod === 200) {
                  const weatherDescription = data.weather[0].description;
                  const temperature = data.main.temp;
                  output.textContent = `Current weather in ${city}: ${weatherDescription}, ${temperature}°C`;
              } else {
                  output.textContent = 'Error fetching weather data: ' + data.message;
              }
          })
          .catch(error => {
              console.error('Weather API Error:', error);
              output.textContent = 'Error communicating with the weather service.';
          })
          .finally(() => {
              // Restart recognition after processing
              recognition.start();
          });
  }

  function processWithOpenAI(command) {
      chrome.storage.local.get(['openaiApiKey'], function(result) {
          const apiKey = result.openaiApiKey;
          if (!apiKey) {
              alert('Please set your OpenAI API key in the extension options.');
              output.textContent = 'API key not set.';
              recognition.start();
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
              // Restart recognition after processing
              recognition.start();
          });
      });
  }

  function fetchWeather(command) {
      // Existing fetchWeather function
  }
});
