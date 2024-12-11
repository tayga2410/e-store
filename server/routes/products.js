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
  sendProducts(ws);

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

function sendProducts(ws) {
  pool.query('SELECT * FROM products ORDER BY id')
    .then((result) => {
      const products = result.rows;
      ws.send(JSON.stringify({ type: 'products', data: products }));
    })
    .catch((err) => {
      console.error('Error fetching products:', err);
    });
}

function broadcastProducts() {
  pool.query('SELECT * FROM products ORDER BY id')
    .then((result) => {
      const products = result.rows;
      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: 'products', data: products }));
        }
      });
    })
    .catch((err) => {
      console.error('Error broadcasting products:', err);
    });
}

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post(
    '/upload',
    authenticateToken,
    authorizeRole('editor', 'superadmin'),
    upload.single('image'),
    async (req, res) => {
      const { name, price, category_id } = req.body;
      const fileUrl = `/uploads/${req.file?.filename}`;
  
      if (!name || !price || !category_id || !req.file) {
        return res
          .status(400)
          .json({ error: 'Name, price, category_id, and image are required' });
      }
  
      try {
        // Получаем category_type из таблицы categories
        const categoryResult = await pool.query(
          'SELECT type FROM categories WHERE id = $1',
          [category_id]
        );
  
        if (categoryResult.rowCount === 0) {
          return res.status(404).json({ error: 'Category not found' });
        }
  
        const categoryType = categoryResult.rows[0].type;
  
        await pool.query(
          'INSERT INTO products (name, price, image_url, category_id, category_type) VALUES ($1, $2, $3, $4, $5)',
          [name, price, fileUrl, category_id, categoryType]
        );
  
        broadcastProducts();
        res.status(201).json({ message: 'Product created successfully' });
      } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Failed to create product' });
      }
    }
  );
  
  router.put('/:id', authenticateToken, authorizeRole('editor', 'superadmin'), async (req, res) => {
    const { id } = req.params;
    const { is_bestseller, is_new, is_featured } = req.body;
  
    try {
      const updates = [];
      const values = [];
      if (is_bestseller !== undefined) {
        updates.push('is_bestseller = $' + (updates.length + 1));
        values.push(is_bestseller);
      }
      if (is_new !== undefined) {
        updates.push('is_new = $' + (updates.length + 1));
        values.push(is_new);
      }
      if (is_featured !== undefined) {
        updates.push('is_featured = $' + (updates.length + 1));
        values.push(is_featured);
      }
  
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
  
      values.push(id);
      const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${values.length}`;
      await pool.query(query, values);
  
      res.json({ message: 'Product updated successfully' });
    } catch (err) {
      console.error('Failed to update product:', err);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });
  
  

router.delete('/:id', authenticateToken, authorizeRole('editor', 'superadmin'), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    broadcastProducts();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Failed to delete product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = { router };
