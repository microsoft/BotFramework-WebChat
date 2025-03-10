import became from './became';
import root from '../pageElements/root';

export default async function focusOn(element, elementDescription = 'a specific element') {
  await became(`focus on ${elementDescription}`, () => root().activeElement === element, 1000);
}
