const express = require('express');
const { Client } = require('pg');
const cors = require('cors');  // Add this line

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());  // Add this line
app.use(express.json());

// Endpoint to handle event insertion
app.post('/insertEvents', async (req, res) => {
  const events = req.body.events;

  // PostgreSQL client configuration
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'hth-project',
    password: 'postgres',
    port: 5432,
  });

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

    res.json({ success: true });
  } catch (err) {
    console.error('Error inserting events:', err);
    res.status(500).json({ success: false, message: 'Error inserting events' });
  } finally {
    await client.end();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});