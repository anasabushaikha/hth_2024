document.addEventListener('DOMContentLoaded', function () {
  const output = document.getElementById('output');
  let recognition;
  let listeningForCommand = false;  // Flag to determine if we should start processing commands

  // Initialize Speech Recognition
  if ('webkitSpeechRecognition' in window) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = false; // Listen for one sentence at a time
      recognition.interimResults = false; // Don't show partial results
      recognition.lang = 'en-US';

      recognition.onstart = function () {
          if (!listeningForCommand) {
              output.textContent = 'Listening for "Hey Mommy"...';
          } else {
              output.textContent = 'Listening for your command...';
          }
      };

      recognition.onresult = function (event) {
          const spokenText = event.results[event.resultIndex][0].transcript.trim().toLowerCase();

          if (!listeningForCommand) {
              // Check if the hotword "Hey Mommy" was spoken
              if (spokenText.includes('hey mommy')) {
                  output.textContent = 'Hotword detected: "Hey Mommy". Now listening for your command...';
                  listeningForCommand = true;
                  recognition.stop();  // Stop current recognition to start command listening
                  startListeningForCommand();  // Start new recognition for command
              } else {
                  output.textContent = 'Hotword not detected. Say "Hey Mommy" to start.';
              }
          }
      };

      recognition.onerror = function (event) {
          output.textContent = 'Error occurred in recognition: ' + event.error;
      };

      // Start listening for the hotword
      recognition.start();

      function startListeningForCommand() {
          const commandRecognition = new webkitSpeechRecognition();
          commandRecognition.continuous = false;  // Command is usually a short phrase
          commandRecognition.interimResults = false;
          commandRecognition.lang = 'en-US';

          commandRecognition.onstart = function () {
              output.textContent = 'Awaiting your command...';
          };

          commandRecognition.onresult = function (event) {
              const command = event.results[0][0].transcript.trim().toLowerCase();
              output.textContent = 'Processing command: ' + command;
              processCommand(command);  // Process the command that was spoken
          };

          commandRecognition.onerror = function (event) {
              output.textContent = 'Error occurred while processing command: ' + event.error;
              listeningForCommand = false;  // Go back to listening for "Hey Mommy"
              recognition.start();  // Start listening for "Hey Mommy" again
          };

          commandRecognition.onend = function () {
              if (!listeningForCommand) {
                  recognition.start();  // Go back to listening for "Hey Mommy"
              }
          };

          commandRecognition.start();  // Start listening for the actual command
      }
  } else {
      output.textContent = 'Web Speech API is not supported in this browser.';
  }

  // Process command (use the OpenAI or weather API depending on the command)
  function processCommand(command) {
      // Example: check if the command is asking for weather
      if (command.includes("weather")) {
          fetchWeather(command); // Call the function for weather
      } else {
          // Handle other commands with OpenAI or other APIs
          output.textContent = 'Command received: ' + command;
          // Simulating API response delay (for testing purposes)
          setTimeout(() => {
              output.textContent = 'Response from API: Example result for "' + command + '"';
              // After handling the command, go back to waiting for the hotword
              listeningForCommand = false;
              recognition.start();  // Go back to listening for "Hey Mommy"
          }, 2000);  // Simulate some delay (2 seconds) for command processing
      }
  }

  function fetchWeather(command) {
      // Replace this with your OpenWeatherMap API key
      const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
      const city = 'Ottawa';  // Extract this from the command if needed

      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
          .then(response => response.json())
          .then(data => {
              if (data.cod === 200) {
                  const weatherDescription = data.weather[0].description;
                  const temperature = data.main.temp;
                  output.textContent = `Current weather in ${city}: ${weatherDescription}, ${temperature}°C`;
              } else {
                  output.textContent = 'Error fetching weather data.';
              }
          })
          .catch(error => {
              console.error('Weather API Error:', error);
              output.textContent = 'Error communicating with the weather service.';
          })
          .finally(() => {
              // After handling the command, go back to waiting for the hotword
              listeningForCommand = false;
              recognition.start();  // Start listening for "Hey Mommy" again
          });
  }
});
