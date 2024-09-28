const { Client } = require('pg');

// PostgreSQL client configuration
const client = new Client({
    user: 'postgres',        // Your PostgreSQL username
    host: 'localhost',       // localhost since it's a local DB
    database: 'hth-project', // The name of your database
    password: 'postgres',    // Your PostgreSQL password
    port: 5432,              // Default PostgreSQL port
  });

// Sample event suggestions JSON
const eventSuggestions = [
  {
    "Event Title": "Wake Up",
    "Day": "2023-10-23",
    "StartTime": "08:00",
    "EndTime": "08:00",
    "Location": "Home",
    "Description": "Start the day",
    "Reminder": ""
  },
  {
    "Event Title": "Commute to University",
    "Day": "2023-10-23",
    "StartTime": "08:00",
    "EndTime": "09:00",
    "Location": "Home to University",
    "Description": "1-hour commute",
    "Reminder": ""
  },
  {
    "Event Title": "Classes",
    "Day": "2023-10-23",
    "StartTime": "09:00",
    "EndTime": "16:00",
    "Location": "University",
    "Description": "Attend classes",
    "Reminder": ""
  }
];

// Function to insert events into the database
async function insertEvents(events) {
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
  } catch (err) {
    console.error('Error inserting events:', err);
  } finally {
    await client.end();
  }
}

// Insert events into the database
insertEvents(eventSuggestions);
