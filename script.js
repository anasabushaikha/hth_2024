// Load the OpenAI API key (use your own key here)
const OPENAI_API_KEY = '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';  // Replace with your OpenAI API key

// Check if the browser supports the Web Speech API
if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert("Sorry, your browser does not support speech recognition.");
} else {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';  // Language: English (US)
    recognition.continuous = true;  // Continue listening after pauses
    recognition.interimResults = false;  // Final results only

    recognition.onstart = function() {
        console.log("Voice recognition started. Speak into the microphone.");
    };

    recognition.onerror = function(event) {
        console.log("Error occurred in recognition: " + event.error);
    };

    recognition.onend = function() {
        console.log("Voice recognition ended.");
    };

    recognition.onresult = function(event) {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        console.log("You said: " + transcript);
        document.getElementById('output').innerText = "Processing: " + transcript;

        // Send the transcribed text to OpenAI GPT-4 for processing
        sendToOpenAI(transcript);
    };

    // Start recognition
    document.getElementById('startBtn').addEventListener('click', () => {
        recognition.start();
    });

    // Stop recognition
    document.getElementById('stopBtn').addEventListener('click', () => {
        recognition.stop();
    });
}

// Function to send transcribed text to GPT-4 using OpenAI API
async function sendToOpenAI(transcript) {
    const apiEndpoint = 'https://api.openai.com/v1/chat/completions';

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
    };

    const data = {
        model: "gpt-4",
        messages: [{ role: "user", content: transcript }],
        max_tokens: 150,
        temperature: 0.7
    };

    try {
        const response = await axios.post(apiEndpoint, data, { headers });
        const gptReply = response.data.choices[0].message.content;
        console.log("GPT-4 Response:", gptReply);
        document.getElementById('output').innerText = gptReply;
    } catch (error) {
        console.error("Error in GPT-4 API request:", error);
        document.getElementById('output').innerText = "Error processing request.";
    }
}
