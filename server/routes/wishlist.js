const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { authenticateToken } = require('../middleware/auth');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT w.id, p.id AS product_id, p.name, p.price, p.image_url 
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { product_id } = req.body;

  try {
    await pool.query(
      `INSERT INTO wishlist (user_id, product_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, product_id]
    );
    res.status(201).json({ message: 'Product added to wishlist' });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const wishlistId = req.params.id;

  try {
    await pool.query(
      `DELETE FROM wishlist WHERE id = $1 AND user_id = $2`,
      [wishlistId, userId]
    );
    res.json({ message: 'Product removed from wishlist' });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

module.exports = router;
