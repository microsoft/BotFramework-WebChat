/* eslint no-magic-numbers: ["off", { "ignore": [1, 2, 3, 60] }] */

function pad(value: number, count = 2): string {
  if (typeof value !== 'number') {
    throw new Error('First argument must be a number');
  }

  let stringValue = value + '';

  while (stringValue.length < count) {
    stringValue = '0' + stringValue;
  }

  return stringValue;
}

// Adopted from https://stackoverflow.com/questions/17415579/how-to-iso-8601-format-a-date-with-timezone-offset-in-javascript.
// Use typing of `Date` from globalThis.
// eslint-disable-next-line no-restricted-globals
export default function dateToLocaleISOString(date: Date): string {
  const isDateLike =
    // @ts-ignore TypeScript think this is always true.
    date.getTimezoneOffset &&
    // @ts-ignore TypeScript think this is always true.
    date.getFullYear &&
    // @ts-ignore TypeScript think this is always true.
    date.getMonth &&
    // @ts-ignore TypeScript think this is always true.
    date.getDate &&
    // @ts-ignore TypeScript think this is always true.
    date.getHours &&
    // @ts-ignore TypeScript think this is always true.
    date.getMinutes &&
    // @ts-ignore TypeScript think this is always true.
    date.getSeconds &&
    date.getMilliseconds;

  if (!isDateLike) {
    throw new Error('First argument must be a Date-like object.');
  }

  const timezoneOffset = -date.getTimezoneOffset();
  const timezoneSign = timezoneOffset < 0 ? '-' : '+';

  // "yyyy-MM-DDTHH:mm:ss.fff+08:00" for GMT+08
  // "yyyy-MM-DDTHH:mm:ss.fffZ" for UTC

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}${
    timezoneOffset ? `${timezoneSign}${pad(~~(Math.abs(timezoneOffset) / 60))}:${pad(timezoneOffset % 60)}` : 'Z'
  }`;
}
