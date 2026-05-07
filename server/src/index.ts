import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';

// Load environment variables
dotenv.config();
dotenv.config({ path: 'src/.env', override: false });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
}, apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Atmospheric Intelligence API is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
