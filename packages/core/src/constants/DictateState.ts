const IDLE = 0 as const;
const WILL_START = 1 as const;
// eslint-disable-next-line no-magic-numbers
const STARTING = 2 as const;
// eslint-disable-next-line no-magic-numbers
const DICTATING = 3 as const;
// eslint-disable-next-line no-magic-numbers
const STOPPING = 4 as const;

export { DICTATING, IDLE, STARTING, STOPPING, WILL_START };
