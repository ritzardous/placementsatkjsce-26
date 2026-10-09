import { createServer } from 'node:http';
import { createAdminTarget } from './firebase-admin.js';
import handler, { configureProcedureApi } from '../api/procedures.js';
const target = createAdminTarget(['--project', 'placement-stats-kjsce', '--allow-production', '--cli-auth']);
configureProcedureApi(target.app);
const server = createServer((req, res) => {
  if (req.url?.split('?')[0] !== '/api/procedures') { res.statusCode = 404; res.end(); return; }
  void handler(req, res);
});
server.listen(5002, '127.0.0.1', () => console.log('Live community API listening on http://127.0.0.1:5002 (Firebase Spark; CLI credentials stay on this laptop).'));
server.on('error', () => { console.error('Could not start the community API on port 5002.'); void target.close(); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => { server.close(() => { void target.close().finally(() => process.exit()); }); });
