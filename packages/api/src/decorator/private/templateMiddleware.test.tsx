/** @jest-environment jsdom */

import { render } from '@testing-library/react';
import React, { Fragment, type ReactNode } from 'react';

import templateMiddleware from './templateMiddleware';

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
  const {
    initMiddleware: initButtonMiddleware,
    Provider: ButtonProvider,
    Proxy: Button,
    types: buttonTypes
  } = templateMiddleware<'button', void, ButtonProps>('Button');

  type ButtonMiddleware = typeof buttonTypes.middleware;

  const {
    initMiddleware: initLinkMiddleware,
    Provider: LinkProvider,
    Proxy: Link,
    types: linkTypes
  } = templateMiddleware<'link', { external: boolean }, LinkProps>('Link');

  type LinkMiddleware = typeof linkTypes.middleware;

  const buttonMiddleware: ButtonMiddleware[] = [init => init === 'button' && (() => () => ButtonImpl)];
  const linkMiddleware: LinkMiddleware[] = [
    init => init === 'link' && (next => request => (request.external ? ExternalLinkImpl : next(request))),
    init => init === 'link' && (() => () => InternalLinkImpl)
  ];

  const App = ({
    children,
    middleware
  }: Readonly<{
    children?: ReactNode | undefined;
    middleware: ReadonlyArray<ButtonMiddleware | LinkMiddleware>;
  }>) => (
    <Fragment>
      {/* TODO: Should not case middleware to any */}
      <ButtonProvider middleware={initButtonMiddleware(middleware as any, 'button')}>
        {/* TODO: Should not case middleware to any */}
        <LinkProvider middleware={initLinkMiddleware(middleware as any, 'link')}>{children}</LinkProvider>
      </ButtonProvider>
    </Fragment>
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
});
