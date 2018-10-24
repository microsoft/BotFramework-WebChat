import { config } from 'dotenv';
import fetch from 'node-fetch';
import FormData from 'form-data';
import program from 'commander';
import readline from 'readline';

import { core } from 'botframework-webchat';
import { DirectLine } from './directLine';

const { createStore, postActivity, startConnection } = core;

config();

const CRLF = '\r\n';

program
  .version('1.0.0');

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.setPrompt('> ');
  rl.pause();

  const store = createStore(
    store => next => action => {
      const { payload, type } = action;

      if (type === 'DIRECT_LINE/RECEIVE_ACTIVITY') {
        const { activity } = payload;

        if (activity.type === 'message') {
          readline.clearLine(process.stdout, -1);
          readline.moveCursor(process.stdout, -2, 0);
          console.log(`${ activity.from.name } said: ${ activity.text || '<nothing>' }`);

          const { attachments } = activity;

          if (attachments && attachments.length) {
            console.log(`(With ${ attachments.length } attachments)`);
          }

          console.log();
          rl.prompt();
        }
      } else if (action.type === 'DIRECT_LINE/CONNECTION_STATUS_UPDATE') {
        switch (payload.readyState) {
          case 1:
            console.log('Connecting to bot...');
            break;

          case 2:
            console.log('Connected to bot.');
            rl.prompt();
            break;
        }
      }

      return next(action);
    }
  );

  store.subscribe(() => {
    // do more here
  });

  store.dispatch(startConnection({
    directLine: new DirectLine({
      domain: process.env.DIRECT_LINE_DOMAIN,
      secret: process.env.DIRECT_LINE_SECRET,
      fetch,
      createFormData: attachments => {
        const formData = new FormData();

        attachments.forEach(({ contentType, data, filename, name }) => {
          formData.append(name, data, {
            contentType,
            filename
          });
        });

        return formData;
      },
      webSocket: false
    }),
    userID: 'default-user'
  }));

  rl.on('line', line => {
    console.log();

    store.dispatch(postActivity({
      text: line,
      type: 'message'
    }));

    rl.prompt();
  });
}

main();
