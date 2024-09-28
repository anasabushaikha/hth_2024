import express from 'express';
import pkg from 'pg';  // Import pg as a package
import cors from 'cors';  // Import cors
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';  // Import stream pipeline to handle audio streaming
 
// Destructure Client from the pg package
const { Client } = pkg;
 
const app = express();
const port = 3000;
 
// Enable CORS for all routes
app.use(cors());
app.use(express.json());
 
app.get('/getEvents', async (req, res) => {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'hth-project',
      password: 'postgres',
      port: 5432,
    });
 
    try {
      await client.connect();
      const query = 'SELECT * FROM events;';
      const result = await client.query(query);
     
      // Log the results to the terminal
      console.log('Fetched events:', result.rows);
 
      // Don't send a response to the client for testing
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching events:', err);
      res.status(500).json({ success: false, message: 'Error fetching events' });
    } finally {
      await client.end();
    }
});
 
// PostgreSQL client configuration
const clientConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'hth-project',
  password: 'postgres',
  port: 5432,
};
 
// Endpoint to handle event insertion
app.post('/insertEvents', async (req, res) => {
  const events = req.body.events;
 
  const client = new Client(clientConfig);
 
  try {
    await client.connect();
 
    for (let event of events) {
      const query = `
        INSERT INTO events (event_title, event_day, start_time, end_time, location, description, reminder)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;
      const values = [
        event["Event Title"],
        event["Day"],
        event["StartTime"],
        event["EndTime"],
        event["Location"],
        event["Description"],
        event["Reminder"]
      ];
 
      await client.query(query, values);
      console.log(`Inserted event: ${event["Event Title"]}`);
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
 
// Endpoint to generate speech using OpenAI's TTS
app.post('/generateSpeech', async (req, res) => {
  const { message } = req.body;
 
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
        voice: 'alloy',
        input: message
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
 
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
 
 