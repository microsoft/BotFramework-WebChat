/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />

import { render } from '@testing-library/react';
import React, { type ReactNode } from 'react';

import templatePolyMiddleware, { type InferMiddleware } from './templatePolyMiddleware';

type ButtonProps = Readonly<{ children?: ReactNode | undefined }>;
type LinkProps = Readonly<{ children?: ReactNode | undefined; href: string }>;

const ButtonImpl = ({ children }: ButtonProps) => <button type="button">{children}</button>;

const ExternalLinkImpl = ({ children, href }: LinkProps) => (
  <a href={href} rel="noopener noreferer">
    {children}
  </a>
);

const InternalLinkImpl = ({ children, href }: LinkProps) => <a href={href}>{children}</a>;

// User story for using templateMiddleware as a building block for uber middleware.
test('an uber middleware', () => {
  jest.spyOn(console, 'warn');

  const buttonTemplate = templatePolyMiddleware<void, ButtonProps>('Button' as any);
  const {
    createMiddleware: createButtonMiddleware,
    extractMiddleware: extractButtonMiddleware,
    Provider: ButtonProvider,
    Proxy: Button,
    reactComponent: buttonComponent
  } = buttonTemplate;

  type ButtonMiddleware = InferMiddleware<typeof ButtonProvider>;

  const linkTemplate = templatePolyMiddleware<{ external: boolean }, LinkProps>('Link' as any);
  const {
    createMiddleware: createLinkMiddleware,
    extractMiddleware: extractLinkMiddleware,
    Provider: LinkProvider,
    Proxy: Link,
    reactComponent: linkComponent
  } = linkTemplate;

  type LinkMiddleware = InferMiddleware<typeof LinkProvider>;

  const buttonMiddleware: ButtonMiddleware[] = [createButtonMiddleware(() => () => buttonComponent(ButtonImpl))];
  const linkMiddleware: LinkMiddleware[] = [
    createLinkMiddleware(next => request => (request.external ? linkComponent(ExternalLinkImpl) : next(request))),
    createLinkMiddleware(() => () => linkComponent(InternalLinkImpl))
  ];

  const App = ({
    children,
    middleware
  }: Readonly<{
    children?: ReactNode | undefined;
    middleware: ReadonlyArray<ButtonMiddleware | LinkMiddleware>;
  }>) => (
    /* TODO: Should not cast middleware to any */
    <ButtonProvider middleware={extractButtonMiddleware(middleware as any)}>
      {/* TODO: Should not cast middleware to any */}
      <LinkProvider middleware={extractLinkMiddleware(middleware as any)}>{children}</LinkProvider>
    </ButtonProvider>
  );

  const result = render(
    <App middleware={[...buttonMiddleware, ...linkMiddleware]}>
      {/* TODO: If "request" is of type "void", we should not need it specified. */}
      <Button request={undefined}>{'Click me'}</Button>
      <Link href="https://bing.com" request={{ external: false }}>
        {'Internal link'}
      </Link>
      <Link href="https://example.com" request={{ external: true }}>
        {'External link'}
      </Link>
    </App>
  );

  expect(result.container).toMatchInlineSnapshot(`
<div>
  <button
    type="button"
  >
    Click me
  </button>
  <a
    href="https://bing.com"
  >
    Internal link
  </a>
  <a
    href="https://example.com"
    rel="noopener noreferer"
  >
    External link
  </a>
</div>
`);

  expect(console.warn).not.toHaveBeenCalled();
});
