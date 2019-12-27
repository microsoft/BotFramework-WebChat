import { Condition } from 'selenium-webdriver';

export default function negateCondition(condition) {
  return new Condition(
    `negate of ${condition.name || 'a condition'}`,
    async (...args) => !(await condition.fn(...args))
  );
}
