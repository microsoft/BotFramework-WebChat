import { useMemo } from 'react';
import useStlyeToEmotionObject from 'botframework-webchat-component/lib/hooks/internal/useStyleToEmotionObject';

export function useStyles<T extends Record<`webchat__${string}`, any>>(styles: T): Record<keyof T, string> {
  const getClassName = useStlyeToEmotionObject();
  // @ts-expect-error: entries/fromEntries don't allow to specify keys type
  return useMemo(
    () =>
      Object.freeze(
        Object.fromEntries(Object.entries(styles).map(([cls, style]) => [cls, `${cls} ${getClassName(style)}`]))
      ),
    [styles, getClassName]
  );
}
