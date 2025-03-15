// const sqlite3 = require('sqlite3').verbose();

// // Open the SQLite database npm run dev-server
// const db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE, (err) => {
//     if (err) {
//         console.error('Error opening database:', err.message);
//     } else {
//         console.log('Connected to SQLite database.');
//     }
// });

// module.exports = db;

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: "postgresql://bloomdb_owner:npg_mFru2Bs6CKSL@ep-rapid-feather-a24645qk-pooler.eu-central-1.aws.neon.tech/bloomdb?sslmode=require",
    ssl: {
        rejectUnauthorized: false, // Required for Neon cloud databases
    },
});

pool.connect()
    .then(() => console.log("Connected to Neon SQL!"))
    .catch((err) => console.error("Connection error:", err));

module.exports = pool;

