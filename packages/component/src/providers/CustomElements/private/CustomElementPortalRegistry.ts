import { type ComponentType, type RefObject } from 'react';

type CustomElementPortal = {
  readonly component: ComponentType<{ readonly [key: string]: string }>;
  readonly element: HTMLElement;
  readonly key: string;
  readonly props: { readonly [key: string]: string };
};

type CustomElementPortalCallback = (portals: readonly CustomElementPortal[]) => void;

type CustomElementPortalScope = {
  readonly callback: CustomElementPortalCallback;
  readonly containerRef?: RefObject<HTMLElement | null | undefined> | undefined;
};

type PortalElementEntry = {
  readonly component: CustomElementPortal['component'];
  readonly getProps: () => CustomElementPortal['props'];
  readonly key: string;
};

const EMPTY_PORTALS: readonly CustomElementPortal[] = Object.freeze([]);

function arePropsEqual(x: CustomElementPortal['props'], y: CustomElementPortal['props']): boolean {
  const yMap = new Map(Object.entries(y));

  return Object.keys(x).length === yMap.size && Object.entries(x).every(([key, value]) => yMap.get(key) === value);
}

function arePortalsEqual(x: readonly CustomElementPortal[], y: readonly CustomElementPortal[]): boolean {
  return (
    x.length === y.length &&
    x.every(({ element, props }, index) => element === y.at(index).element && arePropsEqual(props, y.at(index).props))
  );
}

/**
 * Tracks custom elements whose content is rendered by React through a portal, and the scopes that render these portals.
 *
 * A portal is rendered by the innermost scope whose container has the element, or by the scope without a container.
 * React events from a portal propagate to the React ancestors of its scope, so a scope should be placed where these events would propagate through the DOM, e.g. inside a focus trap.
 */
export default class CustomElementPortalRegistry {
  #elements = new Map<HTMLElement, PortalElementEntry>();
  #nextKey = 0;
  #portalsByScope = new WeakMap<CustomElementPortalScope, readonly CustomElementPortal[]>();
  #scopes = new Set<CustomElementPortalScope>();
  #updateTask: Promise<void> | undefined;

  /**
   * Starts observing changes of the portals rendered by the scope.
   *
   * @returns A function to stop observing.
   */
  observe(callback: CustomElementPortalCallback, containerRef?: CustomElementPortalScope['containerRef']): () => void {
    const scope: CustomElementPortalScope = Object.freeze({ callback, containerRef });

    this.#scopes.add(scope);
    this.#scheduleUpdate();

    return () => {
      this.#scopes.delete(scope);
      this.#scheduleUpdate();
    };
  }

  /**
   * Called by the custom element when it is connected, disconnected, or its attributes changed.
   */
  update(element: HTMLElement, component: PortalElementEntry['component'], getProps: PortalElementEntry['getProps']) {
    this.#elements.has(element) ||
      this.#elements.set(element, Object.freeze({ component, getProps, key: `${this.#nextKey++}` }));
    this.#scheduleUpdate();
  }

  // Changes are batched, so the portal stays when the element is moved (disconnected and connected again) in the same task.
  // Also, custom element callbacks can be called while React is rendering, when React must not be updated.
  #scheduleUpdate() {
    this.#updateTask ||= Promise.resolve().then(() => {
      this.#updateTask = undefined;
      this.#update();
    });
  }

  #update() {
    const scopes = Array.from(this.#scopes);
    const portalsByScope = new Map<CustomElementPortalScope, CustomElementPortal[]>(scopes.map(scope => [scope, []]));

    for (const [element, { component, getProps, key }] of this.#elements) {
      if (element.isConnected) {
        const containingScopes = scopes.filter(({ containerRef }) => containerRef?.current?.contains(element));
        const scope =
          containingScopes.find(
            ({ containerRef }) =>
              !containingScopes.some(
                other =>
                  other.containerRef !== containerRef && containerRef.current.contains(other.containerRef.current)
              )
          ) ?? scopes.find(({ containerRef }) => !containerRef);

        scope && portalsByScope.get(scope).push(Object.freeze({ component, element, key, props: getProps() }));
      } else {
        this.#elements.delete(element);
      }
    }

    for (const [scope, portals] of portalsByScope) {
      if (!arePortalsEqual(portals, this.#portalsByScope.get(scope) ?? EMPTY_PORTALS)) {
        const frozenPortals = Object.freeze(portals);

        this.#portalsByScope.set(scope, frozenPortals);
        scope.callback(frozenPortals);
      }
    }
  }
}

export type { CustomElementPortal, CustomElementPortalCallback };
