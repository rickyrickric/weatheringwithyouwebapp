const { spawn } = require('node:child_process');

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

const processes = [
  {
    name: 'backend',
    command: `${npmCommand} --prefix server run dev`,
  },
  {
    name: 'frontend',
    command: `${npmCommand} run dev:frontend`,
  },
];

const children = processes.map((processConfig) => {
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

  return child;
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
