require('dotenv').config();
const express = require('express');
const cors = require('cors');
//const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const db = require('./db');
const fs = require("fs");
const jwtDecode = require('jwt-decode');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// storage for profile pic uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post('/signup', upload.single('profilePic'), async (req, res) => {
    try {
        const { displayName, username, email, password, accountType } = req.body;
        const profilePic = req.file ? req.file.filename : ''

       

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(`INSERT INTO "Users" (email, username, password, profilePic, displayName, accountType) 
            VALUES ($1, $2, $3, $4, $5, $6);`, [email, username, hashedPassword, profilePic, displayName, accountType], (error, result) => {
            if (error) {
                console.error('Error executing query:', error);
                return;
            }
        });

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Signup failed' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        db.query(
            `SELECT * FROM "Users" WHERE email = $1;`,[email],  async (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                return;
            }
            
            
            if (results.rows.length > 0) {
               
                if (await bcrypt.compare(password, results.rows[0].password)) {
                    const token = jwt.sign({ id: results.rows[0].id }, 'secretKey', { expiresIn: '1h' });
                    console.log(results.rows[0]);
                    res.json({ message: 'Login successful', token, user: results.rows[0] });
                   
                };
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/addpost', upload.single('file'), async (req, res) => {
    try {
        const { token, text } = req.body;
        const file = req.file ? req.file.filename : '';

        const parsedToken = jwtDecode.jwtDecode(token);
        const userid = parsedToken.id;

        db.query(`INSERT INTO "Posts" (user_id, text, media) VALUES ($1, $2, $3);`,[userid, text, file], (error, result) => {
            if (error) {
                console.error('Error executing query:', error);
                return;
            }
        });

        res.status(201).json({ message: 'Posted Successfully'});

    } catch (error) {
        console.error('Error in /addpost:', error);
        res.status(500).json({ error: 'Post Failed' });
    }
});

app.get('/getposts', async (req, res) => {
    try {
        const token = req.body;
        const parsedToken = jwtDecode.jwtDecode(token);
        const userid = parsedToken.id;
       

        db.query((
            `SELECT * FROM "Posts" WHERE user_id = $1;`, [userid],  async (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                return;
            }
            
            if (results.rows > 0) {
                
                res.status(201).json(results.rows);
            }
        }));

    } catch (error) {
        console.error('Error in /addpost:', error);
        res.status(500).json({ error: 'Post Failed' });
    }
});

app.get(":/accountTypeProfile.html", async (req, res) => {
    try {
        let accountTypeProfile = req.params.accountTypeProfile; // Extract from URL
        console.log("🔍 Received accountTypeProfile:", accountTypeProfile);

        // 🚨 Remove "Profile.html" to get only the account type
        const accountType = accountTypeProfile.replace("Profile.html", "");
        console.log("✅ Extracted accountType:", accountType);

        // 🚨 Validate extracted accountType
        if (!accountType) {
            console.error("❌ Invalid accountType:", accountType);
            return res.status(400).json({ error: "Invalid account type" });
        }

        // 🔍 Query database to find user by accountType (ensure column name is correct)
        const result = await db.query(
            `SELECT username, displayname, profilepic
             FROM "Users" WHERE accounttype = $1 LIMIT 1`, // Ensure correct column name
            [accountType]
        );

        console.log("🔍 Database query result:", result.rows); // Debugging log

        // 🚨 Check if user exists
        if (result.rows.length === 0) {
            console.error("❌ User with this account type not found");
            return res.status(404).json({ error: "User not found" });
        }

        const user = result.rows[0];

        // ✅ Send user data as JSON
        res.json(user);

    } catch (err) {
        console.error("❌ Database error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/getProfilePic/:filename", (req, res) => {
    let filename = req.params.filename;  // Get filename from URL
    let imagePath = path.join(__dirname, "uploads", filename);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ error: "Image not found" });
    }

    res.sendFile(imagePath); // Serve the file
});

//start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
