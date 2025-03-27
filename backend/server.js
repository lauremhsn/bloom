require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const db = require('./db');

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
            `SELECT * FROM "Posts" WHERE user_id = $1;`,[userid],  async (error, results) => {
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

app.post('/save-plant-progress', async (req, res) => {
    try {
        const { token, plantStage } = req.body;
        const parsedToken = jwtDecode(token);
        const userId = parsedToken.id;

        const result = await db.query(`SELECT last_interaction, streak FROM "PlantProgress" WHERE user_id = $1`, [userId]);

        let newStreak = 1;
        const today = new Date();
        
        if (result.rows.length > 0) {
            const lastDate = new Date(result.rows[0].last_interaction);
            const timeDiff = (today - lastDate) / (1000 * 60 * 60 * 24); 
            
            if (timeDiff < 1) {
                newStreak = result.rows[0].streak;  
            } else if (timeDiff < 2) {
                newStreak = result.rows[0].streak + 1; 
            }
        }

        await db.query(`
            INSERT INTO "PlantProgress" (user_id, last_interaction, plant_stage, streak) 
            VALUES ($1, NOW(), $2, $3)
            ON CONFLICT (user_id) 
            DO UPDATE SET plant_stage = $2, last_interaction = NOW(), streak = $3;
        `, [userId, plantStage, newStreak]);

        res.json({ message: "Plant progress saved!", streak: newStreak });

    } catch (error) {
        console.error('Error saving plant progress:', error);
        res.status(500).json({ error: 'Failed to save progress' });
    }
});

app.get('/get-plant-progress', async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const parsedToken = jwtDecode(token);
        const userId = parsedToken.id;

        const result = await db.query(`SELECT plant_stage, streak FROM "PlantProgress" WHERE user_id = $1`, [userId]);

        if (result.rows.length > 0) {
            res.json({ plantStage: result.rows[0].plant_stage, streak: result.rows[0].streak });
        } else {
            res.json({ plantStage: 0, streak: 0 });
        }

    } catch (error) {
        console.error('Error fetching plant progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

app.post('/updatePlantProgress', async (req, res) => {
    const { user_id, trimmed, streak, progress, trimmed_at, last_watered } = req.body;

    const query = `
        INSERT INTO "PlantProgress" (user_id, trimmed, streak, last_interaction, progress, trimmed_at, last_watered)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6)
        ON CONFLICT (user_id) 
        DO UPDATE SET trimmed = $2, streak = $3, progress = $4, last_interaction = CURRENT_TIMESTAMP, trimmed_at = $5, last_watered = $6
        RETURNING *;
    `;

    try {
        const result = await db.query(query, [user_id, trimmed, streak, progress, trimmed_at, last_watered]);
        res.status(200).json({ message: 'Plant progress updated successfully', data: result.rows[0] });
    } catch (error) {
        console.error('Error saving plant progress:', error);
        res.status(500).json({ error: 'Error saving plant progress' });
    }
});

app.get('/getPlantProgress/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await db.query('SELECT * FROM "PlantProgress" WHERE user_id = $1;', [user_id]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'Plant progress not found' });
        }
    } catch (error) {
        console.error('Error retrieving plant progress:', error);
        res.status(500).json({ error: 'Error retrieving plant progress' });
    }
});

app.use(express.json());
app.use(session({ secret: "your-secret-key", resave: false, saveUninitialized: true }));

function authenticateUser(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }
    next();
}

app.get("/api/streaks", authenticateUser, async (req, res) => {
    try {
        const userId = req.session.userId; 
        const result = await pool.query(
            'SELECT plant_id, streak_count FROM "Streaks" WHERE user_id = $1',
            [userId]
        );

        const streaks = { plant1: 0, plant2: 0, plant3: 0 };
        result.rows.forEach(row => {
            streaks[row.plant_id] = row.streak_count;
        });

        res.json(streaks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch streak data" });
    }
});

app.post("/api/streaks", authenticateUser, async (req, res) => {
    try {
        const { plantId } = req.body;
        const userId = req.session.userId;

        const result = await pool.query(
            `INSERT INTO "Streaks" (user_id, plant_id, streak_count) 
             VALUES ($1, $2, 1) 
             ON CONFLICT (user_id, plant_id) 
             DO UPDATE SET streak_count = "Streaks".streak_count + 1 
             RETURNING streak_count`,
            [userId, plantId]
        );

        res.json({ streak: result.rows[0].streak_count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update streak" });
    }
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

