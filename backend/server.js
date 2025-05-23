require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const db = require('./db');
const fs = require("fs");
const mailer = require('./mailer');

const { jwtDecode } = require("jwt-decode");
const { isContext } = require('vm');
console.log(jwtDecode);
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

  
app.post('/addpost', upload.single('file'), async (req, res) => {
    try {
        const { token, text } = req.body;
        const file = req.file ? req.file.filename : '';

        const parsedToken = jwtDecode(token);
        const userid = parsedToken.id;

        db.query(
            `INSERT INTO "Posts" (user_id, text, media) VALUES ($1, $2, $3) RETURNING id;`,
            [userid, text, file],
            (error, result) => {
                if (error) {
                    console.error('❌ DB Error:', error);
                    return res.status(500).json({ error: 'Failed to create post' });
                }

                const postId = result.rows[0].id;
                console.log('✅ Post created with ID:', postId);

                res.status(201).json({
                    message: 'Posted Successfully',
                    postId: postId
                });
            }
        );

    } catch (error) {
        console.error('❌ Error in /addpost:', error);
        res.status(500).json({ error: 'Post Failed' });
    }
});


app.get("/api/getCurrentUserId", (req, res) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: "Not logged in" });
    }
  
    res.json({ id: req.session.user.id });
  });


  app.post('/signup', upload.single('profilePic'), async (req, res) => {
    try {
        const { displayName, username, email, password, accountType, plantType } = req.body;
        const profilePic = req.file ? req.file.filename : '';

        const hashedPassword = await bcrypt.hash(password, 10);

        const userQuery = `
            INSERT INTO "Users" (email, username, password, profilePic, displayName, accountType) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
        const userValues = [email, username, hashedPassword, profilePic, displayName, accountType];
        const { rows } = await db.query(userQuery, userValues);

        if (rows.length === 0) {
            return res.status(400).json({ error: 'User registration failed' });
        }

        const user = rows[0];

        const plantQuery = `
            INSERT INTO "Plants" (user1_id) VALUES ($1);
        `;
        await db.query(plantQuery, [user.id]);

        console.log('Inserted User:', user);
        console.log('🌱 Plant Type received:', plantType);

        if (accountType === 'beginner' && plantType) {
            const wateringIntervals = {
                sunflowers: 3.5 * 24 * 60 * 60 * 1000,  // ~2x a week
                tulips: 21 * 24 * 60 * 60 * 1000,
                roses: 4 * 24 * 60 * 60 * 1000,
                cactus: 30 * 24 * 60 * 60 * 1000,
                daisies: 7 * 24 * 60 * 60 * 1000,
            };

            const interval = wateringIntervals[plantType.toLowerCase()];

            await mailer.sendEmail(
                'stephanechedid@gmail.com',
                `🌱 Welcome to Bloom!`,
                `<p>Hi ${displayName},</p>
                 <p>You're now taking care of a <strong>${plantType}</strong> 🌿</p>
                 <p>We'll remind you when it's time to water it!</p>`
            );
        
            if (interval) {
                setTimeout(() => {
                    mailer.sendEmail(
                        'stephanechedid@gmail.com',
                        `🌿 Time to water your ${plantType}!`,
                        `<p>Hi ${displayName},</p>
                         <p>This is your Bloom reminder to water your <strong>${plantType}</strong>.</p>
                         <p>Healthy plant, happy you 🌱</p>`
                    );
                }, interval);
            }}

        return res.json({
            message: 'User registered successfully and plant created',
            user: {
                accounttype: user.accounttype,
                username: user.username,
                displayname: user.displayname,
                profilepic: user.profilepic,
            }
        });

    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({ error: 'Signup failed: ' + error.message });
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

                    //await mailer.sendEmail('stephanechedid@gmail.com','New Login','<p>you have logged in to Bloom</p>')

                    res.json({ message: 'Login successful', token, user: results.rows[0] });
                    
                   
                };
            }

            if (results.rows.length === 0 || !(await bcrypt.compare(password, results.rows[0].password))) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});




// app.post('/addpost', upload.single('file'), async (req, res) => {
//     try {
//         const { token, text } = req.body;
//         const file = req.file ? req.file.filename : '';

//         const parsedToken = jwtDecode.jwtDecode(token);
//         const userid = parsedToken.id;

//         db.query(`INSERT INTO "Posts" (user_id, text, media) VALUES ($1, $2, $3);`,[userid, text, file], (error, result) => {
//             if (error) {
//                 console.error('Error executing query:', error);
//                 return;
//             }
//         });

//         res.status(201).json({ message: 'Posted Successfully'});

//     } catch (error) {
//         console.error('Error in /addpost:', error);
//         res.status(500).json({ error: 'Post Failed' });
//     }
// });

// app.get('/getposts', async (req, res) => {
//     try {
//         const token = req.body;
//         const parsedToken = jwtDecode.jwtDecode(token);
//         const userid = parsedToken.id;
       

//         db.query((
//             `SELECT * FROM "Posts" WHERE user_id = $1;`,[userid],  async (error, results) => {
//             if (error) {
//                 console.error('Error executing query:', error);
//                 return;
//             }
            
//             if (results.rows > 0) {
                
//                 res.status(201).json(results.rows);
//             }
//         }));

//     } catch (error) {
//         console.error('Error in /addpost:', error);
//         res.status(500).json({ error: 'Post Failed' });
//     }
// });


app.get('/users/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const result = await db.query(`
        SELECT id, username, displayname, profilepic
        FROM "Users"
        WHERE id = $1
      `, [userId]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const user = result.rows[0];
  
      res.json({
        id: user.id,
        username: user.username,
        displayname: user.displayname,
        profilepic: user.profilepic || 'pfp1.jpg'
      });
    } catch (err) {
      console.error("Error fetching user:", err);
      res.status(500).json({ message: 'Server error' });
    }
  });


app.get("/getBeginnerTopPosts", async (req, res) => {
    try {
      const result = await db.query(`
        SELECT p.*, u.username, u.displayName, u.profilePic
        FROM "Posts" p
        JOIN "Users" u ON p.user_id = u.id
        WHERE u.accountType = 'beginner'
        ORDER BY p.created_at DESC
        LIMIT 20
      `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching posts:", err);
      res.status(500).json({ error: "Failed to load posts" });
    }
  });

  app.get("/getBusinessTopPosts", async (req, res) => {
    try {
      const result = await db.query(`
        SELECT p.*, u.username, u.displayname, u.profilepic
        FROM "Posts" p
        JOIN "Users" u ON p.user_id = u.id
        WHERE u.accountType = 'business'
        ORDER BY p.created_at DESC
        LIMIT 20
      `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching posts:", err);
      res.status(500).json({ error: "Failed to load posts" });
    }
  });

  app.get("/getNGOTopPosts", async (req, res) => {
    try {
      const result = await db.query(`
        SELECT p.*, u.username, u.displayname, u.profilepic
        FROM "Posts" p
        JOIN "Users" u ON p.user_id = u.id
        WHERE u.accountType = 'ngo'
        ORDER BY p.created_at DESC
        LIMIT 20
      `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching posts:", err);
      res.status(500).json({ error: "Failed to load posts" });
    }
  });

  app.get("/getProTopPosts", async (req, res) => {
    try {
      const result = await db.query(`
        SELECT p.*, u.username, u.displayname, u.profilepic
        FROM "Posts" p
        JOIN "Users" u ON p.user_id = u.id
        WHERE u.accountType = 'professional'
        ORDER BY p.created_at DESC
        LIMIT 20
      `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching posts:", err);
      res.status(500).json({ error: "Failed to load posts" });
    }
  });


app.get('/getposts/:userid', async (req, res) => {
    try {
        const userid = req.params.userid;
        const result = await db.query(`
            SELECT * FROM "Posts" WHERE user_id = $1 ORDER BY created_at DESC
        `, [userid]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Failed to load posts' });
    }
});


app.get("/getProfileByType/:accountType", async (req, res) => {
    const accountType = req.params.accountType;

    try {
        let accountTypeProfile = req.params.accountTypeProfile; 
        console.log("🔍 Received accountTypeProfile:", accountTypeProfile);

        const accountType = accountTypeProfile.replace("Profile.html", "");
        console.log("✅ Extracted accountType:", accountType);


        if (!accountType) {
            console.error(" Invalid accountType:", accountType);
            return res.status(400).json({ error: "Invalid account type" });
        }

        const result = await db.query(
            `SELECT username, displayname, profilepic
             FROM "Users" WHERE accounttype = $1 LIMIT 1`,
            [accountType]
        );

        console.log("Database query result:", result.rows); 

        if (result.rows.length === 0) {
            console.error("User with this account type not found");
            return res.status(404).json({ error: "User not found" });
        }

        const user = result.rows[0];

        res.json(user);

    } catch (err) {
        console.error(" Database error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/getProfilePic/:filename", (req, res) => {
    let filename = req.params.filename;  
    let imagePath = path.join(__dirname, "uploads", filename);

    if (!fs.existsSync(imagePath)) {
        return res.status(404).json({ error: "Image not found" });
    }

    res.sendFile(imagePath);
});

app.post("/updateProfile/:username", upload.single('profilePic'), async(req,res) => {
    try {
        const username = req.params.username;
        const newName = req.body.displayname;
        const newPfp = req.file ? req.file.filename : '';

        console.log(newName, ' ' , newPfp);

        if (newName) {
            await db.query(`
                UPDATE "Users"
                SET displayname = $2
                WHERE username = $1;
            `, [username, newName]);
        };

        if (newPfp) {
            await db.query(`
                UPDATE "Users"
                SET profilepic = $2
                WHERE username = $1;
            `, [username, newPfp]);
        };

        res.status(200).json({ 
            message: "Profile updated succesfully",
            newPfp
        });
    }
    catch {
        res.status(500).json({ error: 'Failed to update profile' });
    }
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

app.get('/getPlantProgress/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    const plant = await db.query(`
        SELECT * FROM plants 
        WHERE user1_id = $1 OR user2_id = $1
    `, [userId]);

    res.json(plant.rows[0]);
});
app.post('/updatePlantProgress', async (req, res) => {
    const { user_id, trimmed, streak, progress, trimmed_at, last_watered, columnPrefix } = req.body;

    const query = `
        UPDATE "Plants" 
        SET 
            ${columnPrefix}_progress = $1, 
            ${columnPrefix}_streak = $2, 
            ${columnPrefix}_trimmed = $3, 
            ${columnPrefix}_last_watered = $4,
            ${columnPrefix}_last_interaction = CURRENT_TIMESTAMP
        WHERE ${columnPrefix}_id = $5
        RETURNING *;
    `;

    try {
        const result = await db.query(query, [progress, streak, trimmed, last_watered, user_id]);

        const plant = result.rows[0];
        if (plant.streak_user1 === 0 && plant.streak_user2 === 0) {
            await db.query(`
                UPDATE "Plants"
                SET dead = true
                WHERE id = $1
            `, [plant.id]);

            res.status(200).json({ message: "The plant has died due to inactivity." });
        } else {
            res.status(200).json({ message: "Plant progress updated successfully", data: result.rows[0] });
        }
    } catch (error) {
        console.error('Error saving plant progress:', error);
        res.status(500).json({ error: 'Error saving plant progress' });
    }
});


app.get('/checkFollowStatus', async (req, res) => {
    const { follower_id, followed_id } = req.query;

    try {
        const result = await db.query(
            `SELECT 1 FROM "Followers" WHERE follower_id = $1 AND followed_id = $2;`, 
            [follower_id, followed_id]
        );

        res.status(200).json({ isFollowing: result.rows.length > 0 });
    } catch (error) {
        console.error('Error checking follow status:', error);
        res.status(500).json({ error: 'Error checking follow status' });
    }
});

app.get('/profile/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await db.query(
            `SELECT username, displayname, profilepic, accountType 
             FROM "Users" WHERE id = $1;`, 
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});


app.get('/getPlantProgress/:user_id', async (req, res) => {
    const { user_id } = req.params;

    const query = `
        SELECT * FROM "Collaborations"
        WHERE ("user1_id" = $1 OR "user2_id" = $1)
    `;
    const result = await db.query(query, [user_id]);

    if (result.rows.length === 0) {
        return res.status(404).json({ error: "No plant found for the user" });
    }

    const plant = result.rows[0];
    res.json({
        progress: plant.user1_progress || plant.user2_progress,
        streak: plant.user1_streak || plant.user2_streak,
        trimmed: plant.user1_trimmed || plant.user2_trimmed,
    });
});


app.use(express.json());
//app.use(session({ secret: "your-secret-key", resave: false, saveUninitialized: true }));

function authenticateUser(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized. Please log in." });
    }
    next();
}


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


app.post('/acceptFriendRequest', (req, res) => {
    const { userId1, userId2 } = req.body;

    const friendQuery = `
        INSERT INTO "Friends" ("friend1_id", "friend2_id") 
        VALUES ($1, $2), ($2, $1);
    `;
    db.query(friendQuery, [userId1, userId2]);

    res.send('Friendship accepted');
});


app.post('/rejectFriendRequest', async (req,res) => {
    const {user1_id , user2_id, plant_id } = req.body;

    try {
        res.status(200).json({message: 'Friend request rejected (no action taken).'});
    }catch(error) {
        res.status(500).json({error: 'Error.'});
    }
});

// app.use('/', require('./routes'));
// app.use(express.static('public')); 
// app.use(bodyParser.json());


// app.post('/create-checkout-session', async (req, res) => {
//     const { productName, productPrice } = req.body;
//     console.log('Received request:', productName, productPrice); 

//     try {
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ['card'],
//             line_items: [{
//                 price_data: {
//                     currency: 'usd',
//                     product_data: {
//                         name: productName,
//                     },
//                     unit_amount: productPrice * 100, 
//                 },
//                 quantity: 1,
//             }],
//             mode: 'payment',
//             success_url: `http://localhost:${PORT}/success.html`,
//             cancel_url: `http://localhost:${PORT}/cancel.html`,
//         });

//         console.log('Session created successfully:', session); 
//         res.json({ sessionId: session.id });
//     } catch (error) {
//         console.error('Error creating session:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });


app.post('/acceptCollabRequest', async(req,res) => {
    const { user1_id , user2_id, plant_id} = req.body;

    try{
        const query = `
        INSERT INTO "Collaborations" ("user1_id", "user2_id", "plant_id")
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [user1_id, user2_id, plant_id];
    const { rows } = await db.query(query, values);

    const updateQuery = `
        UPDATE "Plants"
        SET user2_id = $1
        WHERE id = $2
        RETURNING *;
    `;
    await db.query(updateQuery, [user2_id, plant_id]);

    res.status(200).json({ message: 'Collaboration accepted and plant shared successfully' });
    }
     catch(error) {
        console.error('Error accepting collaboration request: ', error);
        res.status(500).json({error: 'Could not accept collaboration request.'});
    }
});



app.post('/rejectCollabRequest', async (req,res) => {
    const {user1_id , user2_id, plant_id } = req.body;

    try {
        res.status(200).json({message: 'Collaboration rejected (no action taken).'});
    }catch(error) {
        res.status(500).json({error: 'Could not reject collaboration request.'});
    }
});


//for friends page: suggested users
app.get('/suggestedUsers/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
        const query = `
            WITH user_friends AS (
                SELECT CASE
                    WHEN friend1_id = $1 THEN friend2_id
                    ELSE friend1_id
                END AS friend_id
                FROM "Friends"
                WHERE friend1_id = $1 OR friend2_id = $1
            ),
            potential_suggestions AS (
                SELECT CASE
                    WHEN friend1_id != $1 THEN friend1_id
                    ELSE friend2_id
                END AS suggested_id
                FROM "Friends"
                WHERE friend1_id != $1 AND friend2_id != $1
            ),
            mutuals AS (
                SELECT ps.suggested_id, COUNT(*) AS mutual_count
                FROM potential_suggestions ps
                JOIN "Friends" f ON (
                    (f.friend1_id = ps.suggested_id AND f.friend2_id IN (SELECT friend_id FROM user_friends)) OR
                    (f.friend2_id = ps.suggested_id AND f.friend1_id IN (SELECT friend_id FROM user_friends))
                )
                GROUP BY ps.suggested_id
            )
            SELECT u.id, u.username, u.name, u.profile_photo, m.mutual_count
            FROM mutuals m
            JOIN "Users" u ON u.id = m.suggested_id
            WHERE u.id != $1 AND u.id NOT IN (SELECT friend_id FROM user_friends)
            ORDER BY m.mutual_count DESC
            LIMIT 4;
        `;

        const { rows } = await db.query(query, [userId]);

        if (rows.length === 0) {
            res.status(200).json({ message: 'No suggestions available' });
        } else {
            res.status(200).json(rows);
        }
    } catch (error) {
        console.error('Error fetching suggested users:', error);
        res.status(500).json({ error: 'Failed to get suggested users' });
    }
});

// app.post('/add-friend', async (req, res) => {

//     const { token, friendId } = req.body;

//     console.log("token:", token);
//     console.log("friendId (raw):", friendId);

//     try {
//         const parsedToken = jwtDecode(token);
//         const userId = parsedToken.id;

//         if (!friendId || isNaN(parseInt(friendId))) {
//             return res.status(400).json({ error: "Invalid or missing friend ID" });
//         }

//         const friendIdInt = parseInt(friendId);

//         if (userId === friendIdInt) {
//             return res.status(400).json({ error: "You cannot friend yourself!" });
//         }

//         const [id1, id2] = userId < friendIdInt ? [userId, friendIdInt] : [friendIdInt, userId];

//         await db.query(`
//             INSERT INTO "Friends" (friend1_id, friend2_id)
//             VALUES ($1, $2)
//             ON CONFLICT DO NOTHING
//         `, [id1, id2]);

//         res.status(201).json({ message: "Friend added successfully" });
//     } catch (error) {
//         console.error('Error adding friend:', error);
//         res.status(500).json({ error: "Could not add friend" });
//     }
// });

/*
app.post('/add-friend', async (req, res) => {
    const { friend1_id, friend2_id } = req.body;
   
    if (!friend1_id || !friend2_id) {
      return res.status(400).json({ error: 'Missing friend IDs' });
    }
    
    try {
        await db.query(`
            INSERT INTO "Friends" (friend1_id, friend2_id, created_at)
            VALUES ($1, $2, NOW())
        `, [friend1_id, friend2_id]);

        res.status(201).json({ message: 'Friendship added' });
    } catch (err) {
        console.error('Error adding friend:', err);
        res.status(500).json({ error: 'Failed to add friend' });
    }
});
*/

  app.get('/api/search-users', async (req, res) => {
    const searchTerm = decodeURIComponent(req.query.q) || '';
    console.log('Received search query:', searchTerm);
   
    try {
      const searchQuery = `
        SELECT * 
        FROM "Users" 
        WHERE displayname ILIKE $1 OR username ILIKE $1
      `;
      const values = [`%${searchTerm}%`];
      const result = await db.query(searchQuery, values);
      res.json(result.rows);
    } catch (err) {
      console.error('Search API error:', err);
      res.status(500).json({ error: 'Database query failed' });
    }
  });
  
  
  app.post('/sendFriendRequest', async (req, res) => {
    const friend1_id = parseInt(req.body.friend1_id)
    const friend2_id = parseInt(req.body.friend2_id)
    console.log(req.body);
    console.log("Received friend request:", { friend1_id, friend2_id });
  
    try {
        const result = await db.query(
            `SELECT *
             FROM "FriendsREQUESTS"
             WHERE (user1_id = ${friend1_id} AND user2_id = ${friend2_id}) OR (user2_id = ${friend1_id} AND user1_id = ${friend2_id})`
        );
  
        if (result.rowCount > 0) {
            return res.status(200).json({ message: 'Friend request already sent!' });
        }
        else {
            await db.query(
                `INSERT INTO "FriendsREQUESTS" (user1_id, user2_id) 
                 VALUES (${friend1_id}, ${friend2_id})`
            );
        }
        
        res.status(200).json({ message: 'Friend request sent!' });

    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ error: 'Could not send friend request.' });
    }
  });
  
  app.post('/acceptFriendRequest', async (req, res) => {
    const { user1_id, user2_id } = req.body;
  
    try {
        await db.query(
            `DELETE FROM "FriendsREQUESTS" 
             WHERE (friend1_id = ${user1_id} AND friend2_id = ${user2_id}) OR (friend2_id = ${user1_id} AND friend1_id = ${user2_id})`
        );
  
        await db.query(
            `INSERT INTO "Friends" (friend1_id, friend2_id)
             VALUES (${user1_id}, ${user2_id})`
         );
    
         res.status(200).json({ message: 'Friend request accepted!' });
    
        }
    catch (err) {
        await db.query('ROLLBACK');
        console.error('Error accepting friend request:', err);
        res.status(500).json({ error: 'Could not accept friend request.' });
    }
  });

  
  app.post('/rejectFriendRequest', async (req, res) => {
    const { user1_id, user2_id } = req.body;
  
    try {
      await db.query(
        `DELETE FROM "FriendsREQUESTS" 
         WHERE user1_id = $1 AND user2_id = $2`,
        [user1_id, user2_id]
      );
  
      res.status(200).json({ message: 'Friend request rejected!' });
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      res.status(500).json({ error: 'Could not reject friend request.' });
    }
  });
  

  app.post('/sendCollabRequest', async (req, res) => {
    const { user1_id, user2_id } = req.body;
  
    try {
      await db.query(
        `INSERT INTO "CollabREQUESTS" (user1_id, user2_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,  
        [user1_id, user2_id]
      );
      res.status(200).json({ message: 'Collab request sent!' });
    } catch (error) {
      console.error('Error sending collab request:', error);
      res.status(500).json({ error: 'Could not send collab request.' });
    }
  });

  app.post('/acceptFriendRequest', async (req, res) => {
    const { user1_id, user2_id } = req.body;
  
    try {
      await db.query('BEGIN');
  
      await db.query(
        `DELETE FROM "CollabREQUESTS" 
         WHERE user1_id = $1 AND user2_id = $2`,
        [user1_id, user2_id]
      );
  
      await db.query(
        `INSERT INTO "Collaborations" (user1_id, user2_id, plant_id) 
         VALUES ($1, $2) 
         ON CONFLICT DO NOTHING`,
        [user1_id, user2_id]
      );
  
      await db.query('COMMIT');
      res.status(200).json({ message: 'collab request accepted!' });
    } catch (err) {
      await db.query('ROLLBACK');
      console.error('Error accepting collab request:', err);
      res.status(500).json({ error: 'Could not accept collab request.' });
    }
  });


  app.post('/rejectCollabRequest', async (req, res) => {
    const { user1_id, user2_id } = req.body;
  
    try {
      await db.query(
        `DELETE FROM "CollabREQUESTS" 
         WHERE user1_id = $1 AND user2_id = $2`,
        [user1_id, user2_id]
      );
  
      res.status(200).json({ message: 'Collab request rejected!' });
    } catch (err) {
      console.error('Error rejecting collab request:', err);
      res.status(500).json({ error: 'Could not reject collab request.' });
    }
  });


  app.get('/myFriendRequests/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const query = `
            SELECT fr.*, u.id AS other_id, u.username, u.displayname, u.profilepic
            FROM "FriendsREQUESTS" fr
            JOIN "Users" u ON u.id = fr.user1_id
            WHERE fr.user2_id = $1

            UNION

            SELECT fr.*, u.id AS other_id, u.username, u.displayname, u.profilepic
            FROM "FriendsREQUESTS" fr
            JOIN "Users" u ON u.id = fr.user2_id
            WHERE fr.user1_id = $1
        `;
        const result = await db.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({ error: "Could not fetch friend requests." });
    }
});


  
  app.get('/myCollabRequests/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
      const result = await db.query(
        `SELECT cr.*, u.id AS other_id, u.username, u.displayname, u.profilepic
         FROM "CollaborationsREQUESTS" cr
         JOIN "Users" u ON (u.id = CASE WHEN cr.user1_id = $1 THEN cr.user2_id ELSE cr.user1_id END)
         WHERE cr.user1_id = $1 OR cr.user2_id = $1`,
        [userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching collab requests:", error);
      res.status(500).json({ error: "Could not fetch collab requests." });
    }
  });


app.listen(PORT, () => console.log(`Server running on https://bloomm-olel.onrender.com`))
