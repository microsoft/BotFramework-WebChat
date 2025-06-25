/** @jest-environment @happy-dom/jest-environment */

import { render } from '@testing-library/react';
import React, { Fragment, type ReactNode } from 'react';

import templateMiddleware, { type InferMiddleware } from './templateMiddleware';

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
  const buttonTemplate = templateMiddleware<void, ButtonProps>('Button');
  const {
    createMiddleware: createButtonMiddleware,
    extractMiddleware: extractButtonMiddleware,
    Provider: ButtonProvider,
    Proxy: Button
  } = buttonTemplate;

  type ButtonMiddleware = InferMiddleware<typeof buttonTemplate>;

  const linkTemplate = templateMiddleware<{ external: boolean }, LinkProps>('Link');
  const {
    createMiddleware: createLinkMiddleware,
    extractMiddleware: extractLinkMiddleware,
    Provider: LinkProvider,
    Proxy: Link
  } = linkTemplate;

  type LinkMiddleware = InferMiddleware<typeof linkTemplate>;

  const buttonMiddleware: ButtonMiddleware[] = [createButtonMiddleware(() => () => ButtonImpl)];
  const linkMiddleware: LinkMiddleware[] = [
    createLinkMiddleware(next => request => (request.external ? ExternalLinkImpl : next(request))),
    createLinkMiddleware(() => () => InternalLinkImpl)
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
      <ButtonProvider middleware={extractButtonMiddleware(middleware as any)}>
        {/* TODO: Should not case middleware to any */}
        <LinkProvider middleware={extractLinkMiddleware(middleware as any)}>{children}</LinkProvider>
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
