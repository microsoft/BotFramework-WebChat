import { useEffect, useMemo } from 'react';
import { hooks } from 'botframework-webchat-api';

const { useStyleOptions } = hooks;

type InjectedStyleElement = HTMLStyleElement | HTMLLinkElement;

type InjectedStylesInstance = Readonly<{
  styles: readonly InjectedStyleElement[];
  nonce?: string;
  root: Node;
}>;

const sharedInstances: InjectedStylesInstance[] = [];

export default function useInjectStyles(styles: readonly InjectedStyleElement[], nonce?: string) {
  const [{ stylesRoot }] = useStyleOptions();

  const instance = useMemo(() => {
    if (!stylesRoot || !styles.length) {
      return;
    }

    for (const style of styles) {
      if (style.localName !== 'style' && !(style.localName === 'link' && style.getAttribute('rel') === 'stylesheet')) {
        throw new Error(`The useInjectStyles hook supports injecting styles only, got ${style.localName}`);
      }
    }

    const sharedInstance = sharedInstances.find(
      instance =>
        instance.styles.length === styles.length &&
        instance.styles.every(style => styles.includes(style)) &&
        instance.root === stylesRoot &&
        instance.nonce === nonce
    );
    const instance = sharedInstance ?? {
      nonce,
      styles: styles.some(style => style.parentNode)
        ? styles.map(style => style.cloneNode() as HTMLStyleElement)
        : styles,
      root: stylesRoot
    };

    if (!sharedInstance) {
      const { nonce, styles, root } = instance;
      for (const style of styles) {
        nonce ? style.setAttribute('nonce', nonce) : style.removeAttribute('nonce');
        root.appendChild(style);
      }
    }

    sharedInstances.push(instance);

    return instance;
  }, [stylesRoot, nonce, styles]);

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
