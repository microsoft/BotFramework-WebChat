import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = await readFile(join(__dirname, '../sandbox.html'), 'utf8');
const code = await readFile(join(__dirname, '../dist/sandbox.js'), 'utf8');

await writeFile(
  join(__dirname, '../dist/sandbox.html'),
  html.replace('<!-- INJECT JAVASCRIPT -->', () => code)
);
