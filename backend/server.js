import express from 'express';
import pkg from 'pg';  // Import pg as a package
import cors from 'cors';  // Import cors
import axios from 'axios';
import { pipeline } from 'stream';  // Import stream pipeline to handle audio streaming

// Destructure Client from the pg package
const { Client } = pkg;

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// PostgreSQL client configuration
const clientConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'hth-project',
  password: 'postgres',
  port: 5432,
};
app.post('/insertEvents', async (req, res) => {
  const events = req.body.events;
 
 
  const client = new Client(clientConfig);
  console.log(res)
  try {
    await client.connect();
 
 
    for (let event of events) {
      const query = `
        INSERT INTO events (title, day, start_time, end_time, location, description, reminder)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;
      const values = [
        event["title"],    // Consistent naming convention for event properties
        event["day"],
        event["start_time"],
        event["end_time"],
        event["location"],
        event["description"],
        event["reminder"]
      ];
     
      let acc = event;
      console.log(acc)
   
      try {
        await client.query(query, values); // Ensure to wrap in try-catch to handle potential errors
        console.log(`Inserted event: ${event["title"]}`);
      } catch (err) {
        console.error(`Error inserting event: ${event["title"]}`, err);
      }
    } 
    // After successfully inserting, generate speech
    const message = 'You sexy beast! Events have been inserted successfully! Good job, sweetheart!';
    res.json({ success: true });
  } catch (err) {
    console.error('Error inserting events:', err);
    res.status(500).json({ success: false, message: 'Error inserting events' });
  } finally {
    await client.end();
  }
 });
 
 
// Endpoint to fetch events
app.get('/getEvents', async (req, res) => {
  const client = new Client(clientConfig);

  try {
    await client.connect();
    const query = 'SELECT * FROM events;';
    const result = await client.query(query);
    res.json(result.rows); // Send the rows as JSON
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ success: false, message: 'Error fetching events' });
  } finally {
    await client.end();
  }
});

// Endpoint to generate speech using OpenAI's TTS
app.post('/generateSpeech', async (req, res) => {
  const { message, voice = 'shimmer', pitch = -2, speed = 0.9 } = req.body; // Default values for pitch and speed

  try {
    // Call the OpenAI API to generate speech
    const response = await axios({
      method: 'POST',
      url: 'https://api.openai.com/v1/audio/speech',
      headers: {
        'Authorization': `Bearer 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`,
        'Content-Type': 'application/json'
      },
      data: {
        model: 'tts-1',
        voice, // Default voice 'shimmer'
        input: message,
        options: {
          pitch, // Use the provided pitch
          speed  // Use the provided speed
        }
      },
      responseType: 'stream'
    });

    // Set correct headers for audio response
    res.set('Content-Type', 'audio/mpeg');

    // Stream the audio back to the browser
    pipeline(response.data, res, (err) => {
      if (err) {
        console.error('Pipeline error:', err);
        res.status(500).send('Error generating speech');
      }
    });
  } catch (error) {
    console.error('Error generating speech:', error);
    res.status(500).send('Error generating speech');
  }
});

// Add this new endpoint to insert events


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
