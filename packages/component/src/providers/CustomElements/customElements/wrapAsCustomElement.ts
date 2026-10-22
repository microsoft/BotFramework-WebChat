import { type ComponentType } from 'react';

import type CustomElementPortalRegistry from '../private/CustomElementPortalRegistry';

/**
 * Creates a custom element class that renders the React component inside the element, through a portal in the React tree of Web Chat.
 *
 * Attributes of the element are passed as props, `class` is passed as `className`.
 */
export default function wrapAsCustomElement<Props extends { [key: string]: string | undefined } & { children?: never }>(
  component: ComponentType<Props>,
  propKeys: readonly (keyof Props & string)[],
  portalRegistry: CustomElementPortalRegistry
): typeof HTMLElement {
  const attributeNames = Object.freeze(propKeys.map(key => (key === 'className' ? 'class' : key)));

  return class ReactWrapper extends HTMLElement {
    static get observedAttributes(): readonly string[] {
      return attributeNames;
    }

    #getProps = (): { readonly [key: string]: string } =>
      Object.freeze(
        Object.fromEntries(
          propKeys.flatMap(key => {
            const value = this.getAttribute(key === 'className' ? 'class' : key);

            return typeof value === 'string' ? [[key, value]] : [];
          })
        )
      );

    #update() {
      portalRegistry.update(this, component, this.#getProps);
    }

    attributeChangedCallback() {
      this.#update();
    }

    connectedCallback() {
      this.#update();
    }

    disconnectedCallback() {
      this.#update();
    }
  };
}
