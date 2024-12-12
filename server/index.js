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
const { router: cartRouter } = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', authRoutes);
app.use('/api/hero', heroRoutes);
app.use ('/api/categories', categoryRoutes)
app.use ('/api/products', productRoutes)
app.use('/api/catalog', catalogRouter)
app.use('/api/cart', cartRouter);
app.use('/api/wishlist', wishlistRoutes);



app.get('/', (req, res) => {
  res.send('Welcome to the server!');
});


const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (message) => {
    console.log('Message received from client:', message);
    ws.send(`Server received: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.on('upgrade', (req, socket, head) => {
  console.log('Upgrade request received');
  wss.handleUpgrade(req, socket, head, (ws) => {
    console.log('WebSocket connection upgraded');
    wss.emit('connection', ws, req);
  });
});


  