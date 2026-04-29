const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'super-secure-secret-skillswap-ai-2026';

app.use(cors());
app.use(express.json());
// Serve static files from the current directory
app.use(express.static(__dirname));

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), (err) => {
  if (err) console.error('Database connection error:', err.message);
  else console.log('Connected to SQLite database.');
});

// Create tables
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    teach_skills TEXT DEFAULT '[]',
    learn_skills TEXT DEFAULT '[]',
    avatar_initials TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// --- AUTH ENDPOINTS ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, teachSkills, learnSkills } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generate initials (e.g., "Alex Kumar" -> "AK")
    const initials = name.split(' ').map(n => n[0] || '').join('').toUpperCase().substring(0, 2) || 'U';
    
    // Convert comma-separated string to JSON array or default to empty array
    const teachArray = teachSkills ? teachSkills.split(',').map(s => s.trim()).filter(s => s) : [];
    const learnArray = learnSkills ? learnSkills.split(',').map(s => s.trim()).filter(s => s) : [];

    const sql = `INSERT INTO users (name, email, password, teach_skills, learn_skills, avatar_initials) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [name, email, hashedPassword, JSON.stringify(teachArray), JSON.stringify(learnArray), initials], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already exists.' });
        }
        return res.status(500).json({ error: 'Database error.', details: err.message });
      }

      const token = jwt.sign({ id: this.lastID, name: name, email: email }, JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ message: 'User registered successfully', token, user: { id: this.lastID, name, email, initials, teach_skills: teachArray, learn_skills: learnArray } });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.', details: err.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const sql = `SELECT * FROM users WHERE email = ?`;
  db.get(sql, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error.', details: err.message });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

    try {
      user.teach_skills = JSON.parse(user.teach_skills);
      user.learn_skills = JSON.parse(user.learn_skills);
    } catch(e) {
      user.teach_skills = [];
      user.learn_skills = [];
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Logged in successfully', token, user: { id: user.id, name: user.name, email: user.email, initials: user.avatar_initials, teach_skills: user.teach_skills, learn_skills: user.learn_skills } });
  });
});

// --- USER ENDPOINTS ---

// Get Profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  const sql = `SELECT id, name, email, teach_skills, learn_skills, avatar_initials, created_at FROM users WHERE id = ?`;
  db.get(sql, [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error.', details: err.message });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    try {
      user.teach_skills = JSON.parse(user.teach_skills);
      user.learn_skills = JSON.parse(user.learn_skills);
    } catch(e) {
      user.teach_skills = [];
      user.learn_skills = [];
    }

    res.json({ user });
  });
});

// Fallback route for SPA
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
