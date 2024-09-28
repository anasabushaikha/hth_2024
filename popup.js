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
          const spokenText = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
          output.textContent = 'Heard: ' + spokenText;

          // Check if the hotword "Hey Mommy" was spoken
          if (spokenText.includes('hey mommy')) {
              output.textContent = 'Hotword detected: Hey Mommy';
              const command = spokenText.replace('hey mommy', '').trim(); // Get the actual command
              processCommand(command); // Pass command to the AI for processing
          }
      };

      recognition.onerror = function (event) {
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
      // Your previous command handling code here (OpenAI call, weather API, etc.)
      // Example:
      if (command.includes("weather")) {
          fetchWeather(command); // Call the function for weather
      } else {
          // Handle other commands with OpenAI
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
          });
  }
});
