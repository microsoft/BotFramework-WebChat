/* eslint-disable no-console */
/* eslint-disable no-magic-numbers */
/* eslint-env node */

import chalk from 'chalk';
import { exec } from 'child_process';
import { parsePatch } from 'diff';
import { minimatch } from 'minimatch';
import { promisify } from 'util';

function getCategory(
  /** @type { string } */
  path
) {
  return minimatch(path, '*/packages/test/**')
    ? 'test'
    : minimatch(path, '*/packages/**/src/**/*')
      ? 'production'
      : minimatch(path, '**/*.md')
        ? 'doc'
        : minimatch(path, '*/__tests__/**/*')
          ? 'test'
          : minimatch(path, '**/package-lock.json')
            ? 'generated'
            : 'others';
}

function toIntegerOrFixed(
  /** @type { number } */
  value,
  /** @type { number } */
  fractionDigits = 2
) {
  return value % 1 === 0 ? value : value.toFixed(fractionDigits);
}

function toRatio(
  /** @type { number } */
  x,
  /** @type { number } */
  y
) {
  if (x > y) {
    if (y === 0) {
      return [x, 0];
    }

    return [x / y, 1];
  }

  if (x === 0) {
    return [0, y];
  }

  return [1, y / x];
}

function toRatioString(
  /** @type { number } */
  x,
  /** @type { number } */
  y,
  positiveIsGood = false
) {
  const chalks = x === y ? [chalk.yellow, chalk.yellow] : [chalk.green, chalk.red];
  const [ratio1, ratio2] = toRatio(x, y);

  positiveIsGood || chalks.reverse();

  return chalks[x > y ? 0 : 1](`${toIntegerOrFixed(ratio1)}:${toIntegerOrFixed(ratio2)}`);
}

(async () => {
  const { stdout: diffContent } = await promisify(exec)('git diff origin/main', { encoding: 'utf-8' });

  const patches = parsePatch(diffContent);

  /** @type { Map<'doc' | 'generated' | 'others' | 'production' | 'test', { numFile: number; numLineAdded: number; numLineRemoved: number; }> } */
  const stats = new Map();

  stats.set('doc', { numFile: 0, numLineAdded: 0, numLineRemoved: 0 });
  stats.set('generated', { numFile: 0, numLineAdded: 0, numLineRemoved: 0 });
  stats.set('others', { numFile: 0, numLineAdded: 0, numLineRemoved: 0 });
  stats.set('production', { numFile: 0, numLineAdded: 0, numLineRemoved: 0 });
  stats.set('test', { numFile: 0, numLineAdded: 0, numLineRemoved: 0 });

  patches.forEach(patch => {
    if (patch.newFileName || patch.oldFileName) {
      const stat = stats.get(getCategory(patch.newFileName || patch.oldFileName));

      stat.numFile++;

      for (const hunk of patch.hunks) {
        for (const line of hunk.lines) {
          if (line.startsWith('+') && !line.startsWith('+++') && line.substring(1).trim()) {
            stat.numLineAdded++;
          }

          if (line.startsWith('-') && !line.startsWith('---') && line.substring(1).trim()) {
            stat.numLineRemoved++;
          }
        }
      }
    }
  });

  console.log(
    '> Disclaimer: *do not use* any results here to quantify how good this commit. Numbers should never be used to judge quality work and passionate people.'
  );

  console.log();

  console.log('| | Files | Lines added | Lines added and removed | Lines ratio |');
  console.log('| - | - | - | - | - |');

  for (const [name, type] of [
    ['Production code', 'production'],
    ['Test code', 'test'],
    ['Documentation', 'doc'],
    ['Generated code', 'generated'],
    ['Others', 'others']
  ]) {
    console.log(
      `| ${[
        name,
        `${stats.get(type).numFile} files`,
        `${stats.get(type).numLineAdded} lines added`,
        `${stats.get(type).numLineAdded + stats.get(type).numLineRemoved} lines total`,
        `${toRatioString(stats.get(type).numLineAdded, stats.get(type).numLineRemoved)}`
      ].join(' | ')} |`
    );
  }

  console.log();

  const [prodRatio, testRatio] = toRatio(stats.get('production').numLineAdded, stats.get('test').numLineAdded);

  console.log(
    `Test to code ratio = ${toRatioString(stats.get('test').numLineAdded, stats.get('production').numLineAdded)}`
  );

  console.log();

  console.log(
    `${prodRatio === 0 || testRatio > prodRatio ? '😇' : '🚨'} There are ${chalk.magenta(toIntegerOrFixed(testRatio))} lines of test code added for every ${chalk.magenta(toIntegerOrFixed(prodRatio))} lines of production code added.`
  );
})();
