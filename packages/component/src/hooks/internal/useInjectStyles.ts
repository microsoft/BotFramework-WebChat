import { useEffect } from 'react';
import { hooks } from 'botframework-webchat-api';

const { useStyleOptions } = hooks;

const injectedStyleRefs = [];

export default function useInjectStyles(styles: readonly HTMLStyleElement[]) {
  const [{ stylesRoot }] = useStyleOptions();
  useEffect(() => {
    const injectedStyles = [];
    if (stylesRoot && styles?.length) {
      for (const style of styles) {
        const isAddedToTheRoot = stylesRoot.contains(style);
        // We use the passed style node, but:
        // if it's already added to the same root, we only add a ref to it into `injectedStyleRefs`
        // If it's already added to the different root. we clone the style node and add it to the new root
        const injectedStyle = style.parentElement && !isAddedToTheRoot ? style.cloneNode() : style;
        if (!isAddedToTheRoot) {
          stylesRoot.appendChild(injectedStyle);
        }
        injectedStyles.push(injectedStyle);
      }
      injectedStyleRefs.push(...injectedStyles);
      return () => {
        for (const style of injectedStyles) {
          const index = injectedStyleRefs.lastIndexOf(style);
          ~index && injectedStyleRefs.splice(index, 1);
          if (!injectedStyleRefs.includes(style)) {
            style.remove();
          }
        }
      };
    }
  }, [stylesRoot, styles]);
}
