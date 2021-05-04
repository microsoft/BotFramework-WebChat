import became from './became';
import sleep from '../../utils/sleep';

const COUNT = 5;
const WAIT_INTERVAL = 17;

export default async function stabilized(name, getValue) {
  const values = [];

  await became(
    `${name} stabilized after ${COUNT} counts`,
    async () => {
      const value = getValue();

      values.push(value);

      while (values.length > COUNT) {
        values.shift();
      }

      if (values.length === COUNT && values.every(value => value === values[0])) {
        return true;
      }

      await sleep(WAIT_INTERVAL);

      return false;
    },
    5000
  );
}
