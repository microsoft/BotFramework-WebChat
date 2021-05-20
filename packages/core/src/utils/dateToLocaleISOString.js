/* eslint no-magic-numbers: ["off", { "ignore": [1, 2, 3, 60] }] */

function pad(value, count = 2) {
  if (typeof value !== 'number') {
    throw new Error('First argument must be a number');
  }

  value += '';

  while (value.length < count) {
    value = '0' + value;
  }

  return value;
}

// Adopted from https://stackoverflow.com/questions/17415579/how-to-iso-8601-format-a-date-with-timezone-offset-in-javascript.
export default function dateToLocaleISOString(date) {
  if (!(date instanceof Date)) {
    throw new Error('First argument must be a Date object');
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
