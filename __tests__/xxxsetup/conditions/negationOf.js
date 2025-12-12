import { Condition } from 'selenium-webdriver';

export default function negationOf(condition) {
  return new Condition(
    `negation of ${condition.name || 'a condition'}`,
    async (...args) => !(await condition.fn(...args))
  );
}
