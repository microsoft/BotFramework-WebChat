import { createElement, type ComponentType } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

enum ConnectionState {
  CONNECTED,
  PENDING,
  DISCONNECTED
}


export default function wrapAsCustomElement<Props extends { [key: string]: string | undefined } & { children?: never }>(
  component: ComponentType<Props>,
  propKeys: (keyof Props)[]
) {
  type AttributeName = keyof { [K in keyof Props as K extends 'className' ? 'class' : K]: Props[K] } & string;

  const attributeNames = propKeys.map(key => (key === 'className' ? 'class' : key)) as AttributeName[];

  return class ReactWrapper extends HTMLElement {
    static get observedAttributes(): string[] {
      return attributeNames;
    }

    #connected = ConnectionState.DISCONNECTED;
    #ref = new WeakRef(this);

    constructor() {
      super();

      const propMap = (this.#propMap = new Map<keyof Props, null | string | undefined>());

      for (const key of attributeNames) {
        const value = this.getAttribute(key);

        typeof value === 'string' && propMap.set(key === 'class' ? 'className' : key, value);
      }

    }

    #propMap: Map<keyof Props, string>;

    #getProps(): Props {
      const propEntries: [keyof Props, string][] = Array.from<[keyof Props, string]>(this.#propMap.entries());

      return Object.freeze(Object.fromEntries(propEntries) as Props);
    }

    attributeChangedCallback(name: AttributeName, _oldValue: string, newValue: string) {
      if (name === 'class') {
        name = 'className';
      }

      const prevProps = new Map(this.#propMap);

      if (typeof newValue === 'string') {
        this.#propMap.set(name, newValue);
      } else {
        this.#propMap.delete(name);
      }

      const areEqual = Array.from(new Set(prevProps.keys()).union(new Set())).every((key: string) =>
        Object.is(prevProps.get(key), this.#propMap.get(key))
      );

      // For every attribute change, browser will call this function again. It is not batched.
      !areEqual &&
        this.#connected === ConnectionState.CONNECTED &&
        render(createElement(component, this.#getProps()), this);
    }

    connectedCallback() {
      this.#connected !== ConnectionState.PENDING && render(createElement(component, this.#getProps()), this);
      this.#connected = ConnectionState.CONNECTED;
    }

    async disconnectedCallback() {
      this.#connected = ConnectionState.PENDING;
      // eslint-disable-next-line no-restricted-globals
      await new Promise(resolve => setTimeout(resolve));
      if (this.#connected === ConnectionState.PENDING) {
        this.#connected = ConnectionState.DISCONNECTED;
        unmountComponentAtNode(this);
        this.replaceChildren();
      }
    }
  };
}
