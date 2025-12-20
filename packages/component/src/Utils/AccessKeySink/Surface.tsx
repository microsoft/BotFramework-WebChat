import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { forwardRef, useCallback, useRef } from 'react';
import { object, optional, pipe, readonly, string, type InferOutput } from 'valibot';

import useNavigatorPlatform from '../../hooks/internal/useNavigatorPlatform';
import { orSelf as firstTabbableDescendantOrSelf } from '../firstTabbableDescendant';
import AccessKeySinkContext from './internal/Context';

const surfacePropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string()),
    role: optional(string())
  }),
  readonly()
);

type SurfaceProps = InferOutput<typeof surfacePropsSchema>;

const Surface = forwardRef<HTMLDivElement, SurfaceProps>((props, ref) => {
  const { children, className, role } = validateProps(surfacePropsSchema, props);

  const [{ apple }] = useNavigatorPlatform();
  const contextRef = useRef({ focii: [] });

  const handleKeyUp = useCallback(
    event => {
      const { altKey, ctrlKey, key, shiftKey } = event;

      // On Apple, most modern browsers use CTRL + OPTION as modifiers.
      // Otherwise, we use ALT + SHIFT as modifierse.
      if (altKey && (apple ? ctrlKey : shiftKey)) {
        const focii = contextRef.current.focii.filter(entry => entry.keys.includes(key));

        const currentFocus = focii.findIndex(
          ({ ref: { current } }) => current === document.activeElement || current.contains(document.activeElement)
        );
        const nextFocus = focii[(currentFocus + 1) % focii.length];

        if (nextFocus) {
          event.preventDefault();
          event.stopPropagation();

          const tabbable = firstTabbableDescendantOrSelf(nextFocus.ref.current);

          tabbable && tabbable.focus();
        }
      }
    },
    [apple]
  );

  return (
    <AccessKeySinkContext.Provider value={contextRef.current}>
      <div className={className} onKeyUp={handleKeyUp} ref={ref} role={role}>
        {children}
      </div>
    </AccessKeySinkContext.Provider>
  );
});

export default Surface;
export { surfacePropsSchema, type SurfaceProps };
