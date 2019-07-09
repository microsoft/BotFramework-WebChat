import { Condition } from 'selenium-webdriver';

import hasPendingSpeechSynthesisUtterance from '../pageObjects/hasPendingSpeechSynthesisUtterance';

export default function speechSynthesisPending() {
  return new Condition('Speech synthesis is pending', async driver => await hasPendingSpeechSynthesisUtterance(driver));
}

function negate() {
  const condition = speechSynthesisPending();

  return new Condition('Speech synthesis is not pending', async driver => !(await condition.fn(driver)));
}

export { negate };
