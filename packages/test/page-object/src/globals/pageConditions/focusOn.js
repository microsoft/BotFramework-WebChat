import became from './became';

export default async function focusOn(element, elementDescription = 'a specific element') {
  await became(`focus on ${elementDescription}`, () => document.activeElement === element, 1000);
}
