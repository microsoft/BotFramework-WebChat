import React, { Fragment, type ComponentType, type ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { custom, function_, is, looseObject, object, optional, parse, pipe, readonly, string, symbol } from 'valibot';

import ReactWebChat, { type FullReactWebChatProps } from '../FullReactWebChat';
import getCreateRoot, { type CreateWebChatElementRoot, type WebChatElementRoot } from './private/getCreateRoot';
import reactDOMClient from './private/requireReactDOMClient';

/** Props of `<ReactWebChat>`, which the element renders. `styleOptions.stylesRoot` is always the shadow root. */
type WebChatElementProps = FullReactWebChatProps;

/** Props a theme provider receives, such as `FluentThemeProvider`, so its styles go into the shadow root too. */
type WebChatElementThemeProviderProps = {
  readonly children?: ReactNode | undefined;
  readonly nonce?: string | undefined;
  readonly stylesRoot?: Node | undefined;
};

type WebChatElementThemeProvider = ComponentType<WebChatElementThemeProviderProps>;

// Function components, and exotic components like `memo()` and `forwardRef()`.
const themeProviderSchema = optional(
  custom<WebChatElementThemeProvider>(value => is(function_(), value) || is(object({ $$typeof: symbol() }), value))
);

const propsSchema = pipe(
  looseObject({ nonce: optional(string()), styleOptions: optional(looseObject({})) }),
  readonly()
);

// Looked up once, when the module loads: "react-dom/client" first (React 18 and later), then `ReactDOM.render()` (React 16
// and 17). The static build gets "react-dom/client" with `import()`, so this is a promise.
const createRootPromise = Promise.resolve(reactDOMClient).then(client => getCreateRoot(client, ReactDOM));

// Each element reports the rejection when it is connected, the module does not.
createRootPromise.catch(() => undefined);

// Server-side rendering (Node.js) has no `HTMLElement`: the module still imports, as Lit's does.
const BaseHTMLElement: typeof HTMLElement = globalThis.HTMLElement ?? (class {} satisfies object as typeof HTMLElement);

// A property set before the element is defined is an own property that hides the setter: set it again through the setter.
function upgradeProperty(target: HTMLElement, name: 'props' | 'themeProvider'): void {
  if (Object.prototype.hasOwnProperty.call(target, name)) {
    const value: unknown = Reflect.get(target, name);

    Reflect.deleteProperty(target, name);
    Reflect.set(target, name, value);
  }
}

/**
 * Custom element that renders Web Chat into its own open shadow root, and only there.
 *
 * Not defined by Web Chat: call `customElements.define('webchat-element', WebChatElement)` with a name of your choice.
 * Web Chat renders once React DOM is found and both `props` is set and the element is connected.
 *
 * React DOM is found when the module loads: `createRoot()` of "react-dom/client" (React 18 and later), else
 * `ReactDOM.render()` (React 16 and 17). When neither is found, `connectedCallback()` rejects (an unhandled rejection).
 *
 * The `nonce` attribute goes to every style, unless `props.nonce` is set. Changing it mounts Web Chat again.
 */
class WebChatElement extends BaseHTMLElement {
  static get observedAttributes(): readonly string[] {
    return Object.freeze(['nonce']);
  }

  #createRoot: CreateWebChatElementRoot | undefined;
  #props: WebChatElementProps | undefined;
  #root: WebChatElementRoot | undefined;
  #themeProvider: WebChatElementThemeProvider | undefined;

  constructor() {
    super();

    // A declarative shadow root (`<template shadowrootmode="open">`) is reused.
    this.shadowRoot || this.attachShadow({ mode: 'open' });

    upgradeProperty(this, 'props');
    upgradeProperty(this, 'themeProvider');
  }

  /** Props of `<ReactWebChat>`. Setting `undefined` unmounts Web Chat. */
  get props(): WebChatElementProps | undefined {
    return this.#props;
  }

  set props(value: WebChatElementProps | undefined) {
    // Validated once here, `#render()` uses the frozen copy.
    typeof value === 'undefined' || parse(propsSchema, value);

    this.#props = value && Object.freeze({ ...value });
    this.#render();
  }

  /** Optional component to wrap Web Chat with, such as `FluentThemeProvider`. Changing it mounts Web Chat again. */
  get themeProvider(): WebChatElementThemeProvider | undefined {
    return this.#themeProvider;
  }

  set themeProvider(value: WebChatElementThemeProvider | undefined) {
    this.#themeProvider = parse(themeProviderSchema, value);
    this.#render();
  }

  attributeChangedCallback(): void {
    this.#render();
  }

  /** Rejects when React DOM is not found: neither "react-dom/client" nor `ReactDOM.render()`. */
  async connectedCallback(): Promise<void> {
    this.#createRoot ??= await createRootPromise;

    // Does nothing if the element was disconnected while React DOM was being looked up.
    this.#render();
  }

  disconnectedCallback(): void {
    // Unmount in a microtask: a moved element is disconnected and connected again synchronously, and React cannot unmount while rendering.
    queueMicrotask(() => this.isConnected || this.#unmount());
  }

  #render(): void {
    const createRoot = this.#createRoot;
    const props = this.#props;
    const { shadowRoot } = this;

    if (!props) {
      this.#unmount();
    } else if (createRoot && shadowRoot && this.isConnected) {
      // The `nonce` attribute of the element, as for `<script>` and `<style>`, unless the props have one.
      const nonce = props.nonce ?? (this.nonce || undefined);
      const ThemeProvider = this.#themeProvider;

      // Custom elements are inline by default. The page can still override it, its rules win over `:host`.
      const hostStyle = <style nonce={nonce}>{':host { display: block; }'}</style>;

      const webChat = (
        <ReactWebChat
          {...props}
          nonce={nonce}
          styleOptions={Object.freeze({ ...props.styleOptions, stylesRoot: shadowRoot })}
        />
      );

      if (!this.#root) {
        this.#root = createRoot(shadowRoot);

        // Web Chat inserts styles into the shadow root while it renders, before React adds its nodes. React 16 and 17 then
        // warn on unmount, "rendered by another copy of React", unless their first render already put a node first.
        // Remove when React 16 and 17 are dropped.
        this.#root.render(<Fragment>{hostStyle}</Fragment>);
      }

      this.#root.render(
        <Fragment>
          {hostStyle}
          {/* Web Chat drops its styles when its nonce changes and does not add them all again: mount it again. */}
          {/* Remove the key when Web Chat handles a change of `nonce`. */}
          <Fragment key={nonce ?? ''}>
            {ThemeProvider ? (
              <ThemeProvider nonce={nonce} stylesRoot={shadowRoot}>
                {webChat}
              </ThemeProvider>
            ) : (
              webChat
            )}
          </Fragment>
        </Fragment>
      );
    }
  }

  #unmount(): void {
    this.#root?.unmount();
    this.#root = undefined;
  }
}

export default WebChatElement;

export {
  type WebChatElementProps,
  type WebChatElementRoot,
  type WebChatElementThemeProvider,
  type WebChatElementThemeProviderProps
};
