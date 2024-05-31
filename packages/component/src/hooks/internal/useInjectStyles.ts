import { useEffect } from 'react';
import { hooks } from 'botframework-webchat-api';

const { useStyleOptions } = hooks;

export default function useInjectStyles(styles: readonly HTMLStyleElement[]) {
  const [{ stylesRoot }] = useStyleOptions();
  useEffect(() => {
    const injectedStyles = [];
    if (stylesRoot && styles?.length) {
      for (const style of styles) {
        const injectedStyle = style.cloneNode();
        stylesRoot.appendChild(injectedStyle);
        injectedStyles.push(injectedStyle);
      }
      return () => {
        for (const style of injectedStyles) {
          style.remove();
        }
      };
    }
  }, [stylesRoot, styles]);
}
