import { hooks } from 'botframework-webchat-api';
import { useEffect } from 'react';

const { useStyleOptions } = hooks;

type InjectedStylesElement = HTMLLinkElement | HTMLStyleElement;

type InjectedStylesInstance = Readonly<{
  nonce?: string;
  root: Node;
  styles: readonly InjectedStylesElement[];
}>;

const sharedInstances: InjectedStylesInstance[] = [];

function arrayEqual<T>(x: readonly T[], y: readonly T[]): boolean {
  if (x.length !== y.length) {
    return false;
  }

  const set = new Set<T>(x);

  for (const value of y) {
    if (set.has(value)) {
      set.delete(value);
    } else {
      return false;
    }
  }

  return true;
}

export default function useInjectStyles(styles: readonly InjectedStylesElement[], nonce?: string) {
  for (const style of styles) {
    if (style.localName !== 'style' && !(style.localName === 'link' && style.getAttribute('rel') === 'stylesheet')) {
      throw new Error(
        `botframework-webchat: useInjectStyles() hook supports injecting <link rel="stylesheet"> or <style> only, got <${style.localName}>.`
      );
    }
  }

  const [{ stylesRoot: root }] = useStyleOptions();

  useEffect(() => {
    if (!root || !styles.length) {
      return;
    }

    let instance = sharedInstances.find(
      instance => arrayEqual(instance.styles, styles) && instance.root === root && instance.nonce === nonce
    );

    if (!instance) {
      instance = {
        nonce,
        root,
        styles: styles.some(style => style.parentNode)
          ? // Deep clone is required for <style>body { ... }</style> (text node inside).
            styles.map(style => style.cloneNode(true) as InjectedStylesElement)
          : styles
      };

      for (const style of instance.styles) {
        nonce ? style.setAttribute('nonce', nonce) : style.removeAttribute('nonce');

        root.appendChild(style);
      }
    }

    // Extraneous push is intentional. It is for ref counting.
    sharedInstances.push(instance);

    return () => {
      const index = sharedInstances.lastIndexOf(instance);

      ~index && sharedInstances.splice(index, 1);

      if (!sharedInstances.includes(instance)) {
        for (const style of instance.styles) {
          style.remove();
        }
      }
    };
  }, [nonce, root, styles]);
}
