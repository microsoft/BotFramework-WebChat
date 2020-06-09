import wait from './wait';

export default async function waitWithTick(condition, clock, timeout = 2000) {
  const fn = condition.fn.bind(condition);
  let initial = 1;

  return wait({
    ...condition,
    fn: () => {
      initial || clock.tick(1);
      initial = 0;

      return fn();
    }
  }, timeout);
}
