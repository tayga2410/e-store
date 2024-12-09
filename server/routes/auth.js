const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, role',
            [email, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            console.error(err);
            res.status(500).json({ error: 'Registration failed' });
        }
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.get('/profile', authenticateToken, (req, res) => {
    res.json({ message: `Welcome, user ${req.user.email}`, user: req.user });
});

router.post('/create-editor', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
            [email, hashedPassword, 'editor']
        );

        res.status(201).json({ message: 'Editor created successfully', user: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            console.error(err);
            res.status(500).json({ error: 'Failed to create editor' });
        }
    }
});

router.get('/users', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, role FROM users');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.put('/users/:id', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
        await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
        res.json({ message: 'User role updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

router.delete('/users/:id', authenticateToken, authorizeRole('superadmin'), async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
