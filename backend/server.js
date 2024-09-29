import express from 'express';
import pkg from 'pg';  // Import pg as a package
import cors from 'cors';  // Import cors
import axios from 'axios';
import { pipeline } from 'stream';  // Import stream pipeline to handle audio streaming

// Destructure Client from the pg package
// const { Client } = pkg;

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// PostgreSQL client configuration
// const clientConfig = {
//   user: 'postgres',
//   host: 'localhost',
//   database: 'hth-project',
//   password: 'postgres',
//   port: 5432,
// };

let events; // Declare acc globally

// Update acc when inserting events
app.post('/insertEvents', async (req, res) => {
  events = req.body.events;
  console.log(events)

  res.json({ success: true })
})

// Create a new API route to expose the acc value
app.get('/getAcc', (req, res) => {
  if (acc) {
    res.json({ success: true,  events});
  } else {
    res.json({ success: false, message: 'No acc value found' });
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
        'Authorization': `Bearer sk-kMIYGgbTYgHBsSkkRgqas0VLnQf13q-gV6M9vaAG20T3BlbkFJyAwM7arF-usCc18Lihg0yhE_kBwbFfUfJMgMXdvI0A`,
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

// Get events endpoint
app.get('/events', async (req, res) => {
  // Define the client inside the route handler
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'hth-project',
    password: 'postgres',
    port: 5432,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM events');
    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error('Error retrieving events:', err);
    res.status(500).json({
      success: false,
      message: 'Error retrieving events',
    });
  } finally {
    await client.end();
  }
});


// DELETE to handle event deletion
app.delete('/deleteEvent/:id', async (req, res) => {
  const eventId = req.params.id;

  try {
    await client.connect();
    const query = 'DELETE FROM events WHERE id = $1';
    await client.query(query, [eventId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ success: false, message: 'Error deleting event' });
  } finally {
    await client.end();
  }
});

// Endpoint to fetch upcoming events
app.get('/upcomingEvents', async (req, res) => {
  const client = new Client(clientConfig);

  try {
    await client.connect();
    // SQL query to fetch upcoming events based on current date and time
    const result = await client.query(`
      SELECT * FROM public.events
      WHERE (date > CURRENT_DATE)
      OR (date = CURRENT_DATE AND endtime > CURRENT_TIME)
      ORDER BY date, starttime;
    `);

    // Send result as JSON
    res.json({
      success: true,
      events: result.rows,  // Ensure this is result.rows
    });
  } catch (err) {
    console.error('Error fetching upcoming events:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming events',
    });
  } finally {
    await client.end();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
