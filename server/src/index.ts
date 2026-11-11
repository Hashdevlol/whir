import { config } from './config.ts';
import { createWhirServer } from './app.ts';

const server = createWhirServer();

server.http.listen(config.port, config.host, () => {
  console.log(`whir server listening on http://localhost:${config.port}`);
});

process.on('unhandledRejection', (e) => console.error('unhandledRejection', e));
process.on('uncaughtException', (e) => console.error('uncaughtException', e));
for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => {
    void server.close();
    setTimeout(() => process.exit(0), 2000).unref();
  });
}
