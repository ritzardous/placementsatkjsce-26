import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';
async function listening(port) {
  return new Promise(resolve => { const socket = createConnection({ host: '127.0.0.1', port }); const done = result => { socket.destroy(); resolve(result); }; socket.once('connect', () => done(true)); socket.once('error', () => done(false)); socket.setTimeout(1000, () => done(false)); });
}
const children = [];
function start(args) {
  const child = spawn(process.execPath, args, { stdio: 'inherit', env: process.env }); children.push(child);
  child.on('error', () => { console.error('Could not start the app.'); process.exitCode = 1; });
  child.on('exit', code => { if (code) { for (const other of children) if (other !== child) other.kill(); process.exitCode = code; } });
}
if (await listening(5002)) {
  const result = await fetch('http://127.0.0.1:5002/api/procedures', { method: 'POST', signal: AbortSignal.timeout(3000) });
  const body = await result.json().catch(() => null);
  if (result.status !== 401 || body?.error?.code !== 'unauthenticated') throw new Error('Port 5002 is occupied by another service. Stop that service before starting the app.');
  console.log('Using the community API already running on port 5002.');
} else start(['node_modules/tsx/dist/cli.mjs', 'watch', 'scripts/dev-api.ts']);
if (await listening(5173)) console.log('The normal app is already running at http://localhost:5173');
else start(['node_modules/vite/bin/vite.js', '--host', '127.0.0.1']);
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { for (const child of children) child.kill(signal); });
