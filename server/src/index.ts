import dotenv from 'dotenv';
import { createApp } from './app';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();
dotenv.config({ path: 'src/.env', override: false });

const port = process.env.PORT || 3000;
const app = createApp();

// Start server
app.listen(port, () => {
  logger.info({ port }, 'Server is running');
});
