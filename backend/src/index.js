const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config/env');
const routes = require('./routes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
// Allow larger JSON payloads (e.g. testimonials with base64 images up to 1MB → ~1.35MB)
app.use(express.json({ limit: '2mb' }));

app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
});

async function start() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB connected');
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log(`API base: http://localhost:${config.port}/api`);
    });
  } catch (err) {
    console.error('Failed to start:', err.message || err);
    if (err.name === 'MongoServerError' && err.code === 8000) {
      console.error('MongoDB Atlas auth failed. Check README: fix MONGODB_URI (username, password). If password has special chars, URL-encode them (e.g. @ -> %40).');
    }
    process.exit(1);
  }
}

start();
