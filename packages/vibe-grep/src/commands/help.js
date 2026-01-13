/* eslint-env node */
/* eslint-disable no-console */
/* eslint-disable no-magic-numbers */

import fs from 'node:fs';
import path from 'node:path';

const dirname = path.dirname(new URL(import.meta.url).pathname);

export const description = 'Show help information for available commands.';

export function help(...args) {
  const command = args.shift();

  if (command === 'help') {
    console.log(`Usage: vg help [command]

${description}`);
    return;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (command && fs.existsSync(path.join(dirname, `${command}.js`))) {
    return import(`./${command}.js`).then(mod => {
      if (typeof mod.help === 'function') {
        mod.help(...args.slice(1));
      } else {
        console.log(`No help available for command '${command}'.`);
      }
    });
  }
  console.log(`Unknown command: ${command}`);
}

export default async function run(...args) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const commands = fs.readdirSync(dirname).filter(file => file.endsWith('.js'));

  if (args.length === 0) {
    console.log('Available commands:');
    const modules = await Promise.all(
      commands.map(command =>
        import(`./${command}`).catch(() => ({
          description: '<error loading command module>'
        }))
      )
    );
    for (let i = 0; i < commands.length; i++) {
      const commandFile = commands.at(i);
      const commandModule = modules.at(i);
      const command = commandFile.slice(0, -3);
      console.log(`  ${command} - ${commandModule.description || '(no description provided)'}`);
    }
    console.log(`\nUse 'vg help [command]' to get help for a specific command.`);
    return;
  }
  return help(...args);
}
