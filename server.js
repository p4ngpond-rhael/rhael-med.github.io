// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

app.use(express.json());

const db = new sqlite3.Database('./mdkku.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error(err.message);
    else console.log('Server connected to the MDKKU database.');
});

// --- API ENDPOINT FOR ADMIN LOGIN ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ? AND password_hash = ? AND role = 'admin'`;
    db.get(sql, [email, password], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error' });
        if (row) res.json({ success: true });
        else res.status(401).json({ success: false, message: 'Invalid credentials or not an admin.' });
    });
});

// --- NEW: API ENDPOINT FOR STUDENT LOGIN ---
app.post('/api/student-login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT id, username, email, role FROM users WHERE email = ? AND password_hash = ?`;
    db.get(sql, [email, password], (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Server error' });
        if (user) {
            // On success, send back user data (without password)
            res.json({ success: true, user: user });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
    });
});

// --- API ENDPOINT FOR PUBLIC REGISTRATION ---
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    const sql = `INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, 'student')`;
    db.run(sql, [username, email, password], function(err) {
        if (err) return res.status(400).json({ success: false, message: 'Registration failed. Email may already be in use.' });
        res.json({ success: true, id: this.lastID });
    });
});

// ... (All your other API endpoints for topics, materials, and users remain the same) ...
app.get('/api/users', (req, res) => {
    const sql = `SELECT id, username, email, role FROM users ORDER BY username`;
    db.all(sql, [], (err, rows) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json(rows);
    });
});
app.post('/api/users', (req, res) => {
    const { username, email, password, role } = req.body;
    const sql = `INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`;
    db.run(sql, [username, email, password, role], function(err) {
        if (err) { res.status(400).json({ error: err.message }); return; }
        res.json({ id: this.lastID });
    });
});
app.put('/api/users/:id', (req, res) => {
    const { username, email, role } = req.body;
    const sql = `UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?`;
    db.run(sql, [username, email, role, req.params.id], function(err) {
        if (err) { res.status(400).json({ error: err.message }); return; }
        res.json({ changes: this.changes });
    });
});
app.delete('/api/users/:id', (req, res) => {
    const sql = `DELETE FROM users WHERE id = ?`;
    db.run(sql, req.params.id, function(err) {
        if (err) { res.status(400).json({ error: err.message }); return; }
        res.json({ deleted: this.changes });
    });
});
app.get('/api/topics', (req, res) => {
    const sql = `SELECT * FROM topics ORDER BY year, name`;
    db.all(sql, [], (err, rows) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json(rows);
    });
});
app.post('/api/topics', (req, res) => {
    const { year, name, description } = req.body;
    const sql = `INSERT INTO topics (year, name, description) VALUES (?, ?, ?)`;
    db.run(sql, [year, name, description], function(err) {
        if (err) { res.status(400).json({ error: err.message }); return; }
        res.json({ id: this.lastID });
    });
});
app.put('/api/topics/:id', (req, res) => {
    const { year, name, description } = req.body;
    const sql = `UPDATE topics SET year = ?, name = ?, description = ? WHERE id = ?`;
    db.run(sql, [year, name, description, req.params.id], function(err) {
        if (err) { res.status(400).json({ error: err.message }); return; }
        res.json({ changes: this.changes });
    });
});
app.delete('/api/topics/:id', (req, res) => {
    const sql = `DELETE FROM topics WHERE id = ?`;
    db.run(sql, req.params.id, function(err) {
        if (err) { res.status(400).json({ error: err.message }); return; }
        res.json({ deleted: this.changes });
    });
});
app.get('/api/topic/:id', (req, res) => {
    const sql = `SELECT * FROM topics WHERE id = ?`;
    db.get(sql, [req.params.id], (err, row) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json(row);
    });
});
app.get('/api/topics/year/:year', (req, res) => {
    const sql = `SELECT * FROM topics WHERE year = ? ORDER BY name`;
    db.all(sql, [req.params.year], (err, rows) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json(rows);
    });
});
app.get('/api/materials/topic/:topic_id', (req, res) => {
    const sql = `SELECT * FROM materials WHERE topic_id = ? ORDER BY title`;
    db.all(sql, [req.params.topic_id], (err, rows) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json(rows);
    });
});


// Serve static files
app.use(express.static(path.join(__dirname, '')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server is live at http://localhost:${port}`);
});
