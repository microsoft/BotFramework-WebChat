/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { render } from '@testing-library/react';
import React from 'react';

import DefaultAvatar from './DefaultAvatar';

// Production builds of `validateProps()` return props as-is, defaults in the schema are not applied.
jest.mock('@msinternal/botframework-webchat-react-valibot', () => ({
  ...jest.requireActual('@msinternal/botframework-webchat-react-valibot'),
  validateProps: (_: unknown, props: unknown) => props
}));

// Children and hooks need the Web Chat context, they are not under test.
jest.mock('../../Avatar/ImageAvatar', () => () => null);
jest.mock('../../Avatar/InitialsAvatar', () => () => 'CU');
jest.mock('../../hooks/internal/styleToEmotionObject', () => ({ useStyleToEmotionObject: () => () => '' }));
jest.mock('../../hooks/useStyleSet', () => () => [{ avatar: '' }]);

test('when "aria-hidden" is not set in production build, should hide initials from assistive technologies', () => {
  const { container } = render(<DefaultAvatar fromUser={true} />);

  expect(container.querySelector('.webchat__defaultAvatar')?.getAttribute('aria-hidden')).toBe('true');
});

test('when "aria-hidden" is false in production build, should expose initials to assistive technologies', () => {
  const { container } = render(<DefaultAvatar aria-hidden={false} fromUser={true} />);

  expect(container.querySelector('.webchat__defaultAvatar')?.getAttribute('aria-hidden')).toBe('false');
});
