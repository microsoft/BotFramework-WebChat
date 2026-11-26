/** The time of an ISO 8601 timestamp, in milliseconds since the epoch (`NaN` if it cannot be parsed). Reads no clock. */
export default function parseTimestamp(timestamp: string): number {
  // Parsing is pure: the ponyfill is for the clock (`Date.now()`, timers), so the global `Date` parses.
  // eslint-disable-next-line no-restricted-globals
  return Date.parse(timestamp);
}
