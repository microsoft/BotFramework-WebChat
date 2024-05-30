import { useEffect } from 'react';
import { useStylesRoot } from './useStylesRoot';

export default function useInjectStyles(styles: readonly HTMLStyleElement[]) {
  const root = useStylesRoot();
  useEffect(() => {
    if (root && styles?.length) {
      for (const style of styles) {
        root.appendChild(style);
      }
      return () => {
        for (const style of styles) {
          style.remove();
        }
      };
    }
  }, [root, styles]);
}
