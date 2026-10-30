import React, { Fragment, type ComponentType, type ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { custom, function_, is, looseObject, object, optional, parse, pipe, readonly, string, symbol } from 'valibot';

import { legacyReactDOMSchema } from '../private/reactDOMSchemas';

/** A root from `createRoot()` of "react-dom/client". */
type WebChatElementRoot = { render(children: ReactNode): void; unmount(): void };

/** Props a theme provider receives, such as `FluentThemeProvider`, so its styles go into the shadow root too. */
type WebChatElementThemeProviderProps = {
  readonly children?: ReactNode | undefined;
  readonly nonce?: string | undefined;
  readonly stylesRoot?: Node | undefined;
};

type CreateWebChatElementClassInit = {
  /**
   * `createRoot()` of "react-dom/client", from the same React the page gives Web Chat.
   *
   * Required on React 19 or later. When not set, the element uses `createRoot()` of "react-dom" if it has one (React 18),
   * otherwise `ReactDOM.render()` (React 16 and 17, including the React DOM 16.8.6 bundled in `webchat.js`).
   */
  readonly createRoot?: ((container: ShadowRoot) => WebChatElementRoot) | undefined;
};

interface WebChatElement<P extends object> extends HTMLElement {
  /** Props of `<ReactWebChat>`. Web Chat renders after it is set; `styleOptions.stylesRoot` is always the shadow root. */
  props: P | undefined;

  /** Optional component to wrap Web Chat with, such as `FluentThemeProvider`. */
  themeProvider: ComponentType<WebChatElementThemeProviderProps> | undefined;
}

type WebChatElementConstructor<P extends object> = {
  new (): WebChatElement<P>;
  readonly prototype: WebChatElement<P>;
};

// Function components, and exotic components like `memo()` and `forwardRef()`.
const componentSchema = custom<ComponentType<WebChatElementThemeProviderProps>>(
  value => is(function_(), value) || is(object({ $$typeof: symbol() }), value)
);

const createWebChatElementClassInitSchema = pipe(object({ createRoot: optional(function_()) }), readonly());

const propsSchema = pipe(
  looseObject({ nonce: optional(string()), styleOptions: optional(looseObject({})) }),
  readonly()
);

// Keeps the root as-is: `object()` would copy its methods without `this`.
const rootSchema = custom<WebChatElementRoot>(value =>
  is(object({ render: function_(), unmount: function_() }), value)
);

const themeProviderSchema = optional(componentSchema);

// `createRoot()` of "react-dom", which React 18 has but warns about outside of "react-dom/client" in development.
const reactDOMWithCreateRootSchema = object({ createRoot: function_() });

// A property set before the element is defined is an own property that hides the setter: set it again through the setter.
function upgradeProperty(target: HTMLElement, name: 'props' | 'themeProvider'): void {
  if (Object.prototype.hasOwnProperty.call(target, name)) {
    const value: unknown = Reflect.get(target, name);

    Reflect.deleteProperty(target, name);
    Reflect.set(target, name, value);
  }
}

// Picks how to render into the shadow root, from the React the page gives Web Chat: ESM imports, `window.ReactDOM`, or the bundled React DOM.
function getCreateRoot(
  createRoot: ((container: ShadowRoot) => unknown) | undefined
): (container: ShadowRoot) => WebChatElementRoot {
  if (createRoot) {
    return container => parse(rootSchema, createRoot(container));
  } else if (is(reactDOMWithCreateRootSchema, ReactDOM)) {
    const { createRoot: reactDOMCreateRoot } = parse(reactDOMWithCreateRootSchema, ReactDOM);

    return container => parse(rootSchema, reactDOMCreateRoot(container));
  } else if (is(legacyReactDOMSchema, ReactDOM)) {
    const { render } = parse(legacyReactDOMSchema, ReactDOM);

    // React 16 and 17: React 16 listens for events on the container only if it is a document or a shadow root, so render into the shadow root itself.
    // React 16 empties the container when it first renders: Web Chat adds its styles afterwards, in effects.
    return container =>
      Object.freeze({
        render: (children: ReactNode) => render(children, container),
        unmount: () => {
          ReactDOM.unmountComponentAtNode(container);
        }
      });
  }

  throw new Error(
    'botframework-webchat: createWebChatElementClass() on React 19 or later needs createRoot() of "react-dom/client": pass createWebChatElementClass({ createRoot }).'
  );
}

/**
 * Creates a custom element class that renders Web Chat into its own open shadow root, and only there.
 *
 * Does not define the element: call `customElements.define(name, createWebChatElementClass())` with a name of your choice.
 *
 * @throws On React 19 or later when `createRoot` is not passed.
 */
export default function createWebChatElementClass<P extends object>(
  ReactWebChat: ComponentType<P>,
  init?: CreateWebChatElementClassInit | undefined
): WebChatElementConstructor<P> {
  const createRoot = getCreateRoot(parse(createWebChatElementClassInitSchema, init ?? {}).createRoot);

  return class WebChatElement extends HTMLElement {
    #props: P | undefined;
    #root: WebChatElementRoot | undefined;
    #themeProvider: ComponentType<WebChatElementThemeProviderProps> | undefined;

    constructor() {
      super();

      // A declarative shadow root (`<template shadowrootmode="open">`) is reused.
      this.shadowRoot || this.attachShadow({ mode: 'open' });
    }

    get props(): P | undefined {
      return this.#props;
    }

    set props(value: P | undefined) {
      typeof value === 'undefined' || parse(propsSchema, value);

      this.#props = value && Object.freeze({ ...value });
      this.#render();
    }

    get themeProvider(): ComponentType<WebChatElementThemeProviderProps> | undefined {
      return this.#themeProvider;
    }

    set themeProvider(value: ComponentType<WebChatElementThemeProviderProps> | undefined) {
      this.#themeProvider = parse(themeProviderSchema, value);
      this.#render();
    }

    connectedCallback(): void {
      upgradeProperty(this, 'props');
      upgradeProperty(this, 'themeProvider');

      this.#render();
    }

    disconnectedCallback(): void {
      // Unmount in a microtask: a moved element is disconnected and connected again synchronously, and React cannot unmount while rendering.
      queueMicrotask(() => this.isConnected || this.#unmount());
    }

    #render(): void {
      const props = this.#props;
      const { shadowRoot } = this;

      if (!props || !shadowRoot || !this.isConnected) {
        // Setting `props` to `undefined` unmounts Web Chat.
        props || this.#unmount();

        return;
      }

      const { nonce: propsNonce, styleOptions } = parse(propsSchema, props);
      // The `nonce` attribute of the element, as for `<script>` and `<style>`, unless the props have one.
      const nonce = propsNonce ?? (this.nonce || undefined);
      const ThemeProvider = this.#themeProvider;

      const webChat = (
        <ReactWebChat
          {...props}
          nonce={nonce}
          styleOptions={Object.freeze({ ...styleOptions, stylesRoot: shadowRoot })}
        />
      );

      this.#root ??= createRoot(shadowRoot);

      this.#root.render(
        <Fragment>
          {/* Custom elements are inline by default. The page can still override it, its rules win over `:host`. */}
          <style nonce={nonce}>{':host { display: block; }'}</style>
          {ThemeProvider ? (
            <ThemeProvider nonce={nonce} stylesRoot={shadowRoot}>
              {webChat}
            </ThemeProvider>
          ) : (
            webChat
          )}
        </Fragment>
      );
    }

    #unmount(): void {
      this.#root?.unmount();
      this.#root = undefined;
    }
  };
}

export {
  type CreateWebChatElementClassInit,
  type WebChatElement,
  type WebChatElementConstructor,
  type WebChatElementRoot,
  type WebChatElementThemeProviderProps
};
