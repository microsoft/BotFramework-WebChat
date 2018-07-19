import { config } from 'dotenv';
// import { DirectLine } from 'botframework-directlinejs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import program from 'commander';
import readline from 'readline';

import { createStore, postActivity, startConnection } from 'backend';
import { DirectLine } from './directLine';

config();

const CRLF = '\r\n';

program
  .version('1.0.0');

function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.pause();

  const store = createStore();

  store.subscribe(() => {
    const state = store.getState();

    if (state.connection.readyState === 1) {
      rl.resume();
      rl.setPrompt('>');
    }
  });

  store.dispatch(startConnection({
    directLine: new DirectLine({
      domain: process.env.DIRECT_LINE_DOMAIN,
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
    userID: 'default-user',
    username: 'User-1'
  }));

  rl.on('line', line => {
    store.dispatch(postActivity({
      text: line,
      type: 'message'
    }));
  });
}

main();
