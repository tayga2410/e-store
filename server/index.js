require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const wss = require('./wss');

const authRoutes = require('./routes/auth');
const heroRoutes = require('./routes/hero');
const { router: categoryRoutes } = require('./routes/categories');
const { router: productRoutes } = require('./routes/products');
const { router: catalogRouter } = require('./routes/catalog'); 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', authRoutes);
app.use('/api/hero', heroRoutes);
app.use ('/api/categories', categoryRoutes)
app.use ('/api/products', productRoutes)
app.use('/api/catalog', catalogRouter)

app.get('/', (req, res) => {
  res.send('Welcome to the server!');
});


const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on('upgrade', (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });


  