import { Condition } from 'selenium-webdriver';

export default function negateCondition(condition) {
  return new Condition(`Negate of ${condition.name}`, async (...args) => !(await condition.fn(...args)));
}
