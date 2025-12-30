// Windows does not have "touch", and there are no common shell commands on Windows (cmd) and Linux that can do the job.

/// <reference types="node" />

import { closeSync, openSync, utimesSync } from 'fs';

// eslint-disable-next-line no-magic-numbers, no-undef, prefer-destructuring
const filename = process.argv[2];

// eslint-disable-next-line security/detect-non-literal-fs-filename
closeSync(openSync(filename, 'a'));

const now = new Date();

// eslint-disable-next-line security/detect-non-literal-fs-filename
utimesSync(filename, now, now);
