import { hooks } from 'botframework-webchat-api';
import { useEffect, useMemo } from 'react';

const { useStyleOptions } = hooks;

type InjectedStylesElement = HTMLLinkElement | HTMLStyleElement;

type InjectedStylesInstance = Readonly<{
  nonce?: string;
  root: Node;
  styles: readonly InjectedStylesElement[];
}>;

const sharedInstances: InjectedStylesInstance[] = [];

export default function useInjectStyles(styles: readonly InjectedStylesElement[], nonce?: string) {
  const [{ stylesRoot: root }] = useStyleOptions();

  const instance = useMemo(() => {
    if (!root || !styles.length) {
      return;
    }

    for (const style of styles) {
      if (style.localName !== 'style' && !(style.localName === 'link' && style.getAttribute('rel') === 'stylesheet')) {
        throw new Error(
          `botframework-webchat: useInjectStyles() hook supports injecting <link rel="stylesheet"> or <style> only, got <${style.localName}>.`
        );
      }
    }

    let instance = sharedInstances.find(
      instance =>
        instance.styles.length === styles.length &&
        instance.styles.every(style => styles.includes(style)) &&
        instance.root === root &&
        instance.nonce === nonce
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

    return instance;
  }, [root, nonce, styles]);

  useEffect(
    () =>
      instance &&
      (() => {
        const index = sharedInstances.lastIndexOf(instance);

        ~index && sharedInstances.splice(index, 1);

        if (!sharedInstances.includes(instance)) {
          for (const style of instance.styles) {
            style.remove();
          }
        }
      }),
    [instance]
  );
}
