const express = require('express');
const { Pool } = require('pg');
const router = express.Router();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.get('/', async (req, res) => {
    const { category, sort, page = 1, limit = 10, minPrice, maxPrice } = req.query;
    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];

    if (category && category !== 'all') {
        filters.push('p.category_type = $' + (values.length + 1));
        values.push(category);
    }

    if (minPrice) {
        filters.push('p.price >= $' + (values.length + 1));
        values.push(minPrice);
    }

    if (maxPrice) {
        filters.push('p.price <= $' + (values.length + 1));
        values.push(maxPrice);
    }

    let orderBy = 'p.id';
    if (sort === 'price_asc') orderBy = 'p.price ASC';
    if (sort === 'price_desc') orderBy = 'p.price DESC';
    if (sort === 'new') orderBy = 'p.created_at DESC';

    const baseQuery = `
        FROM products p
        ${filters.length ? 'WHERE ' + filters.join(' AND ') : ''}
    `;

    const dataQuery = `
        SELECT p.*
        ${baseQuery}
        ORDER BY ${orderBy}
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const countQuery = `
        SELECT COUNT(*) AS total
        ${baseQuery}
    `;

    values.push(limit, offset);

    try {
        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery, values),
            pool.query(countQuery, values.slice(0, values.length - 2)),
        ]);

        const total = parseInt(countResult.rows[0].total, 10);
        const products = dataResult.rows;

        res.json({
            products,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        console.error('Failed to fetch products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

module.exports = { router };
