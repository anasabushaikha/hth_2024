function processCommand(command) {
  // Disable the start button to prevent multiple clicks
  startButton.disabled = true;

  // Detect if it's a weather query
  if (command.toLowerCase().includes("weather")) {
    fetchWeather(command);
  } else {
    // Process other commands with OpenAI
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
          max_tokens: 150,
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
      startButton.disabled = false;
    });
}
