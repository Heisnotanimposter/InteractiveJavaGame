const express = require('express');
const db = require('../database');
const router = express.Router();

// Get all posts
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM posts ORDER BY created_at DESC';
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ posts: rows });
    });
});

// Create post (Protected ideally, but simple for now)
router.post('/', (req, res) => {
    const { user_id, username, title, content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const sql = 'INSERT INTO posts (user_id, username, title, content) VALUES (?, ?, ?, ?)';
    db.run(sql, [user_id || 0, username || 'Anonymous', title || '', content], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID });
    });
});

module.exports = router;
