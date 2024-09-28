const { Client } = import('pg');


// Set up client details
const client = new Client({
  user: 'postgres',        // Your PostgreSQL username
  host: 'localhost',       // localhost since it's a local DB
  database: 'hth-project', // The name of your database
  password: 'postgres',    // Your PostgreSQL password
  port: 5432,              // Default PostgreSQL port
});

// Connect to the database
client.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Connection error', err.stack));


// Insert test data
const insertTestEvents = async () => {
  try {
    await client.query(`
      INSERT INTO events (event_title, event_day, event_start_time, event_end_time, location, description, reminder)
      VALUES 
        ('Team Meeting', '2024-09-30', '14:00:00', '15:00:00', 'Conference Room A', 'Discuss project updates', '30 minutes'::interval),
        ('Lunch with Sarah', '2024-10-01', '12:30:00', '13:30:00', 'Café', 'Catch up and discuss project.', '15 minutes'::interval);
    `);
    console.log('Test events inserted');
  } catch (error) {
    console.error('Error inserting events:', error);
  }
};

// GET endpoint to retrieve all events
const getTasks = async () => {
  try {
    const result = await pool.query('SELECT * FROM events ORDER BY event_day, event_start_time');
    console.log('Query result:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'An error occurred while fetching tasks' });
  }
};

// Query the database after inserting data
const queryEvents = async () => {
  try {
    const res = await client.query('SELECT * FROM events;');
    console.log('Event rows:', res.rows); // logs all rows
  } catch (error) {
    console.error('Error querying events:', error);
  } finally {
    client.end(); // Close the connection
  }
};

// Run both operations sequentially
const runDatabaseOperations = async () => {
  await insertTestEvents();  // Insert test events
  await queryEvents();       // Query the table
};

runDatabaseOperations();


// Function to fetch events and set reminders
const setReminders = async () => {
  try {
    const res = await client.query('SELECT * FROM events;');
    const events = res.rows;

    events.forEach(event => {
      const endTime = new Date(`${event.event_day}T${event.event_end_time}`);
      const reminderTime = new Date(endTime.getTime() - 15 * 60 * 1000); // 15 minutes before end time

      const now = new Date();
      const timeUntilReminder = reminderTime - now;

      if (timeUntilReminder > 0) {
        setTimeout(() => {
          chrome.runtime.sendMessage({ action: 'showReminder', event });
        }, timeUntilReminder);
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};

setReminders();