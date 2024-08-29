import { hooks } from 'botframework-webchat-api';
import { useEffect } from 'react';

const { useStyleOptions } = hooks;

type InjectedStylesInstance = Readonly<{
  nonce?: string;
  root: Node;
  sheets: readonly CSSStyleSheet[];
  tags: readonly HTMLStyleElement[];
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

function convertCSSStyleSheetToStyle(stylesheet: CSSStyleSheet) {
  const style = document.createElement('style');

  if (!stylesheet.cssRules) {
    return style;
  }

  const cssText = Array.from(stylesheet.cssRules)
    .map(rule => rule.cssText ?? '')
    .join('\n');

  const textNode = document.createTextNode(cssText);

  style.append(textNode);

  return style;
}

export default function useInjectStyles(sheets: readonly CSSStyleSheet[], nonce?: string) {
  const [{ stylesRoot: root }] = useStyleOptions();

  useEffect(() => {
    if (!root || !sheets.length) {
      return;
    }

    let instance = sharedInstances.find(
      instance => arrayEqual(instance.sheets, sheets) && instance.root === root && instance.nonce === nonce
    );

    if (!instance) {
      instance = {
        nonce,
        root,
        sheets,
        tags: sheets.map(sheet => convertCSSStyleSheetToStyle(sheet))
      };

      for (const style of instance.tags) {
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
        for (const style of instance.tags) {
          style.remove();
        }
      }
    };
  }, [nonce, root, sheets]);
}
