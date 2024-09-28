const { Client } = require('pg');

// Set up client details
const client = new Client({
  user: 'postgres',        // Your PostgreSQL username
  host: 'localhost',            // localhost since it's a local DB
  database: 'hth-project',    // The name of your database
  password: 'postgres',    // Your PostgreSQL password
  port: 5432,                   // Default PostgreSQL port
});

// Connect to the database
client.connect()
  .then(() => console.log('Connected to the database'))
  .catch(err => console.error('Connection error', err.stack));

// Example query
client.query('SELECT * FROM events;', (err, res) => {
  if (err) {
    console.error(err);
  } else {
    console.log(res.rows); // logs all rows
  }
  client.end(); // Close the connection
});
