/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { render } from '@testing-library/react';
import React from 'react';

import VideoContent from './VideoContent';

// Production builds of `validateProps()` return props as-is, the URL is not validated.
jest.mock('@msinternal/botframework-webchat-react-valibot', () => ({
  ...jest.requireActual('@msinternal/botframework-webchat-react-valibot'),
  validateProps: (_: unknown, props: unknown) => props
}));

// The video player needs the Web Chat context, it is not under test.
jest.mock('../hooks/useStyleSet', () => () => [{ videoContent: '' }]);

test.each([
  ['root-relative', '/videos/intro.mp4'],
  ['path-relative', 'intro.mp4'],
  ['protocol-relative', '//example.com/intro.mp4'],
  ['without a host', 'https://'],
  ['with an invalid host', 'http://[invalid']
])('when the URL is %s in production build, should render nothing', (_, src) => {
  const { container } = render(<VideoContent src={src} />);

  expect(container.innerHTML).toBe('');
});

test('when the URL is absolute in production build, should render a video player', () => {
  const { container } = render(<VideoContent src="https://example.com/intro.mp4" />);

  expect(container.querySelector('video')?.getAttribute('src')).toBe('https://example.com/intro.mp4');
});
