// routes/cart.js
const express = require('express');
const { Pool } = require('pg');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.id; 
  try {
    const result = await pool.query(
      'SELECT c.id, c.product_id, p.name, p.price, p.image_url, c.quantity FROM cart_items c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity = 1 } = req.body;

  if (!product_id) {
    return res.status(400).json({ error: 'product_id is required' });
  }

  try {
    const existing = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [userId, product_id]
    );

    if (existing.rowCount > 0) {
      const newQty = existing.rows[0].quantity + quantity;
      await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [newQty, existing.rows[0].id]);
    } else {
      await pool.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [userId, product_id, quantity]
      );
    }

    res.json({ message: 'Product added/updated in cart successfully' });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Failed to add product to cart' });
  }
});

// Обновить количество товара в корзине
router.put('/:itemId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 1) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  try {
    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, itemId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found or not belongs to user' });
    }

    res.json({ message: 'Quantity updated successfully' });
  } catch (err) {
    console.error('Error updating quantity:', err);
    res.status(500).json({ error: 'Failed to update quantity' });
  }
});

// Удалить товар из корзины
router.delete('/:itemId', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *',
      [itemId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Error removing item from cart:', err);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Синхронизация гостевой корзины с сервером после логина
router.post('/sync', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { items } = req.body; 
  // items: [{ product_id: number, quantity: number }, ...]

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items must be an array' });
  }

  try {
    for (const item of items) {
      const { product_id, quantity } = item;
      if (!product_id || !quantity || quantity < 1) continue;

      const existing = await pool.query(
        'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [userId, product_id]
      );

      if (existing.rowCount > 0) {
        const newQty = existing.rows[0].quantity + quantity;
        await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [newQty, existing.rows[0].id]);
      } else {
        await pool.query(
          'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
          [userId, product_id, quantity]
        );
      }
    }

    res.json({ message: 'Cart synced successfully' });
  } catch (err) {
    console.error('Error syncing cart:', err);
    res.status(500).json({ error: 'Failed to sync cart' });
  }
});

module.exports = { router };
