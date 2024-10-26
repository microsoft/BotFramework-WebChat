import { createElement, type ComponentType } from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

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

      if (typeof newValue === 'string') {
        this.#propMap.set(name, newValue);
      } else {
        this.#propMap.delete(name);
      }

      // For every attribute change, browser will call this function again. It is not batched.
      render(createElement(component, this.#getProps()), this);
    }

    connectedCallback() {
      render(createElement(component, this.#getProps()), this);
    }

    disconnectedCallback() {
      unmountComponentAtNode(this);
    }
  };
}
