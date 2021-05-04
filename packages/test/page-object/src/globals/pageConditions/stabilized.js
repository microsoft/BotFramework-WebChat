import became from './became';
import sleep from '../../utils/sleep';

const WAIT_INTERVAL = 17;

export default async function stabilized(name, getValue, count, timeout) {
  const values = [];

  await became(
    `${name} stabilized after ${count} counts`,
    async () => {
      const value = getValue();

      values.push(value);

      while (values.length > count) {
        values.shift();
      }

      if (values.length === count && values.every(value => value === values[0])) {
        return true;
      }

      await sleep(WAIT_INTERVAL);

      return false;
    },
    timeout
  );
}
