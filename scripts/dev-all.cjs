const { spawn } = require('node:child_process');
const http = require('node:http');

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const backendPort = process.env.PORT || '3000';

const processes = {
  backend: {
    name: 'backend',
    command: `${npmCommand} --prefix server run dev`,
  },
  frontend: {
    name: 'frontend',
    command: `${npmCommand} run dev:frontend`,
  },
};

const children = [];

const startProcess = (processConfig) => {
  const child = isWindows
    ? spawn('cmd.exe', ['/d', '/s', '/c', processConfig.command], {
      cwd: process.cwd(),
      stdio: 'inherit',
    })
    : spawn(processConfig.command, {
    cwd: process.cwd(),
    stdio: 'inherit',
      shell: true,
    });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`${processConfig.name} stopped with ${signal}`);
      return;
    }

    if (code !== 0) {
      console.error(`${processConfig.name} exited with code ${code}`);
      shutdown();
    }
  });

  children.push(child);
  return child;
};

const checkBackend = () =>
  new Promise((resolve) => {
    const request = http.get(
        {
          hostname: '127.0.0.1',
          port: backendPort,
          path: '/health',
          timeout: 1000,
        },
        (response) => {
          response.resume();
        resolve(Boolean(response.statusCode && response.statusCode >= 200 && response.statusCode < 500));
        },
      );

      request.on('timeout', () => {
        request.destroy();
      resolve(false);
      });

    request.on('error', () => resolve(false));
  });

const waitForBackend = ({ attempts = 40, delayMs = 250 } = {}) =>
  new Promise((resolve, reject) => {
    let attempt = 0;

    const check = async () => {
      attempt += 1;

      if (await checkBackend()) {
        resolve();
        return;
      }

      if (attempt >= attempts) {
        reject(new Error(`Backend did not become ready on port ${backendPort}`));
        return;
      }

      setTimeout(check, delayMs);
    };

    void check();
  });

const start = async () => {
  if (await checkBackend()) {
    console.log(`using existing backend on http://127.0.0.1:${backendPort}`);
    startProcess(processes.frontend);
    return;
  }

  startProcess(processes.backend);
  await waitForBackend();
    console.log(`backend ready on http://127.0.0.1:${backendPort}`);
    startProcess(processes.frontend);
};

start().catch((error) => {
    console.error(error.message);
    shutdown();
    process.exit(1);
  });

function shutdown() {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
