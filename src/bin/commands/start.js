// @flow

import puppeteer from 'puppeteer';
import onDeath from 'death';
import {
  createPool
} from 'generic-pool';
import WebSocket from 'ws';
import Logger from '../../Logger';

export const command = 'start';
export const desc = 'Starts a cluster of headless Chrome instances.';

const log = Logger.child({
  command
});

// eslint-disable-next-line flowtype/no-weak-types
export const builder = (yargs: Object) => {
  return yargs
    .options({
      'maximum-instances': {
        default: 1,
        describe: 'Maximum number of Chrome instances open at any time.',
        type: 'number'
      },
      'minimum-instances': {
        default: 0,
        describe: 'Minimum number of Chrome instances open at any time.',
        type: 'number'
      },
      port: {
        default: 9000,
        type: 'number'
      }
    });
};

type ArgvType = {|
  +maximumInstances: number,
  +minimumInstances: number,
  +port: number
|};

export const handler = async (argv: ArgvType) => {
  log.debug('starting a headless Chrome instance cluster under port %d', argv.port);

  const pool = createPool({
    create: async () => {
      const browser = await puppeteer.launch();

      const url = browser._connection.url();

      log.debug('created Chrome (url: %s)', url);

      return {
        browser,
        url
      };
    },
    destroy: async (instance) => {
      await instance.browser.close();

      log.debug('destroyed Chrome (url: %s)', instance.url);
    }
  }, {
    max: argv.maximumInstances,
    min: argv.minimumInstances
  });

  pool.start();

  const wss = new WebSocket.Server({
    port: argv.port
  });

  wss.on('connection', (ws) => {
    const messageQueue = [];

    let server;

    pool
      .acquire()
      // eslint-disable-next-line promise/always-return
      .then((instance) => {
        const wsc = new WebSocket(instance.url);

        wsc.on('open', () => {
          log.debug('connected to Chrome (url: %s)', instance.url);

          server = wsc;

          for (const message of messageQueue) {
            wsc.send(message);
          }
        });

        wsc.on('close', () => {
          log.debug('Chrome disconnected (url: %s)', instance.url);

          server = null;
        });

        wsc.on('message', (message) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        });

        ws.on('close', () => {
          log.debug('client disconnected');

          pool.destroy(instance);
        });
      })
      .catch(() => {
        log.fatal('failed to acquire Chrome instance');
      });

    ws.on('message', (message) => {
      if (server) {
        server.send(message);
      } else {
        messageQueue.push(message);
      }
    });
  });

  const closeServer = () => {
    return new Promise((resolve) => {
      wss.close(resolve);
    });
  };

  onDeath(async () => {
    log.debug('shutting down the cluster');

    await pool.drain();
    await pool.clear();

    // @todo Close active connections to the server.

    await closeServer();

    // eslint-disable-next-line no-process-exit
    process.exit();
  });
};
