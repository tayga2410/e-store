const express = require('express');
const multer = require('multer');
const { Pool } = require('pg');
const wss = require('../wss');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  sendCategories(ws);

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

function sendCategories(ws) {
  pool.query('SELECT * FROM categories ORDER BY id')
    .then((result) => {
      const categories = result.rows;
      ws.send(JSON.stringify({ type: 'categories', data: categories }));
    })
    .catch((err) => {
      console.error('Error fetching categories:', err);
    });
}

function broadcastCategories() {
  pool.query('SELECT * FROM categories ORDER BY id')
    .then((result) => {
      const categories = result.rows;
      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: 'categories', data: categories }));
        }
      });
    })
    .catch((err) => {
      console.error('Error broadcasting categories:', err);
    });
}

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/upload', authenticateToken, authorizeRole('editor', 'superadmin'), upload.single('image'), async (req, res) => {
  const { name, type } = req.body;
  const fileUrl = `/uploads/${req.file.filename}`;

  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  try {
    await pool.query('INSERT INTO categories (name, icon_url, type) VALUES ($1, $2, $3)', [name, fileUrl, type]);
    broadcastCategories();
    res.status(201).json({ message: 'Category created successfully' });
  } catch (err) {
    console.error('Failed to create product:', err.message || err);
    res.status(500).json({ error: 'Failed to create product' });
}

  
});

router.delete('/:id', authenticateToken, authorizeRole('editor', 'superadmin'), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    broadcastCategories();
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Failed to delete category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = { router };
