import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
dotenv.config({ path: 'src/.env', override: false });

type LoggerLike = {
  info: (bindings: Record<string, unknown>, message: string) => void;
  error: (bindings: Record<string, unknown>, message: string) => void;
  fatal: (bindings: Record<string, unknown>, message: string) => void;
};

let resolvedLogger: LoggerLike | Console = console;

const reportFatal = (error: unknown, message: string) => {
  const payload = error instanceof Error ? { err: error } : { err: { error } };

  if ('fatal' in resolvedLogger && typeof resolvedLogger.fatal === 'function') {
    resolvedLogger.fatal(payload, message);
    return;
  }

  if ('error' in resolvedLogger && typeof resolvedLogger.error === 'function') {
    resolvedLogger.error(payload, message);
    return;
  }

  console.error(message, error);
};

const failFast = (error: unknown, message: string) => {
  reportFatal(error, message);
  process.exit(1);
};

process.on('unhandledRejection', (reason) => {
  failFast(reason, 'Unhandled promise rejection');
});

process.on('uncaughtException', (error) => {
  failFast(error, 'Uncaught exception');
});

async function bootstrap() {
  try {
    const [{ createApp }, { logger }] = await Promise.all([
      import('./app'),
      import('./utils/logger'),
    ]);

    resolvedLogger = logger;

    const port = Number(process.env.PORT || 3000);
    const app = createApp();
    const server = app.listen(port, () => {
      logger.info({ port }, 'Server is running');
    });

    server.on('error', (error) => {
      failFast(error, 'HTTP server failed');
    });
  } catch (error) {
    failFast(error, 'Server bootstrap failed');
  }
}

void bootstrap();
