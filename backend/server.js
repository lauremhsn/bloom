require('dotenv').config();
const express = require('express');
const cors = require('cors');
//const mongoose = require('mongoose');
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

//database connection -- later on
/* mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));
 
const UserSchema = new mongoose.Schema({
    displayName: String,
    username: String,
    email: String,
    password: String,
    accountType: String,
    profilePic: String
});

const User = mongoose.model('User', UserSchema);
*/

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
        
        /*const newUser = new User({
            displayName, username, email, password: hashedPassword, accountType,
            profilePic: req.file ? req.file.filename : null
        });
        await newUser.save();
        */

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
                    
                    res.json({ message: 'Login successful', token });
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
        });

    } catch (error) {
        console.error('Error in /addpost:', error);
        res.status(500).json({ error: 'Post Failed' });
    }
});

//start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
