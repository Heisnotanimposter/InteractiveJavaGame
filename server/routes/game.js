const express = require('express');
const db = require('../database');
const router = express.Router();

// Get chunk
router.get('/chunk', (req, res) => {
    const { x, z } = req.query;
    if (x === undefined || z === undefined) return res.status(400).json({ error: 'Missing coords' });

    const id = `${x},${z}`;
    db.get('SELECT data FROM chunks WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        if (!row) return res.json({ data: null }); // Not found is fine
        res.json({ data: JSON.parse(row.data) });
    });
});

// Save chunk
router.post('/chunk', (req, res) => {
    const { x, z, data } = req.body;
    // data should be array of block updates or full chunk data
    // For simplicity, we store the whole chunk's modified blocks

    const id = `${x},${z}`;
    const dataStr = JSON.stringify(data);

    db.run('INSERT OR REPLACE INTO chunks (id, data) VALUES (?, ?)', [id, dataStr], (err) => {
        if (err) return res.status(500).json({ error: 'Save error' });
        res.json({ success: true });
    });
});

module.exports = router;
