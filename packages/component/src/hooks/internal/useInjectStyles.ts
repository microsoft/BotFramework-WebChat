import { useEffect } from 'react';
import { hooks } from 'botframework-webchat-api';

const { useStyleOptions } = hooks;

export default function useInjectStyles(styles: readonly HTMLStyleElement[]) {
  const [{ stylesRoot }] = useStyleOptions();
  useEffect(() => {
    if (stylesRoot && styles?.length) {
      for (const style of styles) {
        stylesRoot.appendChild(style);
      }
      return () => {
        for (const style of styles) {
          style.remove();
        }
      };
    }
  }, [stylesRoot, styles]);
}
