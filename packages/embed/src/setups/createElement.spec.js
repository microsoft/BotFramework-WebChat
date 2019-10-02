/**
 * @jest-environment jsdom
 */

import createElement from './createElement';

test('Create an element with attribute', () => {
  const script = createElement('script', { src: 'https://example.com/test.js' });

  expect(script).toHaveProperty('outerHTML', '<script src="https://example.com/test.js"></script>');
});

test('Create an element with two children', () => {
  const ul = createElement('ul', {}, createElement('li', {}, 'Buy eggs'), createElement('li', {}, 'Buy milk'));

  expect(ul).toHaveProperty('outerHTML', '<ul><li>Buy eggs</li><li>Buy milk</li></ul>');
});

test('Create an element with click event', () => {
  let clickCalled = jest.fn();
  const button = createElement('button', { onClick: clickCalled });

  button.click();
  expect(clickCalled).toHaveBeenCalledTimes(1);
});

test('Create an element with stylesheet', () => {
  const image = createElement('img', { style: { backgroundColor: 'Black' } });

  expect(image).toHaveProperty('outerHTML', '<img style="background-color: Black;">');
});

test('Create an element with boolean attribute of true', () => {
  const checkbox = createElement('input', { disabled: true, type: 'checkbox' });

  expect(checkbox).toHaveProperty('outerHTML', '<input disabled="" type="checkbox">');
});

test('Create an element with boolean attribute of false', () => {
  const checkbox = createElement('input', { disabled: false, type: 'checkbox' });

  expect(checkbox).toHaveProperty('outerHTML', '<input type="checkbox">');
});
