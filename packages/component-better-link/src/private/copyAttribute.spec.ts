/** @jest-environment @happy-dom/jest-environment */

import copyAttribute from './copyAttribute';

let fromElement: HTMLElement;
let toElement: HTMLElement;

beforeEach(() => {
  fromElement = document.createElement('div');
  toElement = document.createElement('div');
});

test('should copy string value', () => {
  fromElement.setAttribute('class', 'hello-world');

  copyAttribute(fromElement, toElement, 'class');

  expect(toElement.getAttribute('class')).toEqual('hello-world');
});

test('should copy empty string', () => {
  fromElement.setAttribute('class', '');
  toElement.setAttribute('class', 'aloha');

  copyAttribute(fromElement, toElement, 'class');

  expect(toElement.getAttribute('class')).toEqual('');
});

test('should not copy unset attribute', () => {
  toElement.setAttribute('class', 'aloha');

  copyAttribute(fromElement, toElement, 'class');

  expect(toElement.getAttribute('class')).toEqual('aloha');
});
