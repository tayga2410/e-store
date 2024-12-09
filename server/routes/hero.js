const express = require('express');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM hero_banners ORDER BY position');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch banners' });
    }
});

router.post('/upload', authenticateToken,  authorizeRole('editor', 'superadmin'), upload.single('image'), async (req, res) => {
    const fileUrl = `/uploads/${req.file.filename}`;
    const { position } = req.body;

    try {
        await pool.query('INSERT INTO hero_banners (url, position) VALUES ($1, $2)', [fileUrl, position]);
        res.status(201).json({ message: 'Banner uploaded successfully', url: fileUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload banner' });
    }
});

router.put('/:id', authenticateToken,  authorizeRole('editor', 'superadmin'), async (req, res) => {
    const { id } = req.params;
    const { url } = req.body;

    try {
        await pool.query('UPDATE hero_banners SET url = $1 WHERE id = $2', [url, id]);
        res.json({ message: 'Banner updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update banner' });
    }
});

router.delete('/:id', authenticateToken,  authorizeRole('editor', 'superadmin'), async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM hero_banners WHERE id = $1', [id]);
        res.json({ message: 'Banner deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete banner' });
    }
});

module.exports = router;
