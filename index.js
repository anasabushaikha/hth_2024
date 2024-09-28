const { Client } = require('pg');

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
