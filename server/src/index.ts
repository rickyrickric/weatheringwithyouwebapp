import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: 'src/.env', override: false });

async function bootstrap() {
  const [{ createApp }, { logger }] = await Promise.all([
    import('./app'),
    import('./utils/logger'),
  ]);

  const port = process.env.PORT || 3000;
  const app = createApp();

  app.listen(port, () => {
    logger.info({ port }, 'Server is running');
  });
}

void bootstrap();
