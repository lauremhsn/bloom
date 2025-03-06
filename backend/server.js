require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//database connection -- later on
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
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

// storage for profile pic uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post('/signup', upload.single('profilePic'), async (req, res) => {
    try {
        const { displayName, username, email, password, accountType } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            displayName, username, email, password: hashedPassword, accountType,
            profilePic: req.file ? req.file.filename : null
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Signup failed' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, 'secretKey', { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

//start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
