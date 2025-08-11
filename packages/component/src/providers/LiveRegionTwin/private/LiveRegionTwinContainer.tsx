import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { Fragment } from 'react';
import { literal, object, optional, pipe, readonly, string, union, type InferInput } from 'valibot';

import useMarkAllAsRenderedEffect from './useMarkAllAsRenderedEffect';
import useStaticElementEntries from './useStaticElementEntries';

const liveRegionTwinContainerPropsSchema = pipe(
  object({
    'aria-label': optional(string()),
    'aria-live': union([literal('assertive'), literal('polite')]),
    'aria-roledescription': optional(string()),
    className: optional(string()),
    role: optional(string()),
    textElementClassName: optional(string())
  }),
  readonly()
);

type LiveRegionTwinContainerProps = InferInput<typeof liveRegionTwinContainerPropsSchema>;

// This container is marked as private because we assume there is only one instance under the <LiveRegionTwinContext>.
function LiveRegionTwinContainer(props: LiveRegionTwinContainerProps) {
  const {
    'aria-label': ariaLabel,
    'aria-live': ariaLive,
    'aria-roledescription': ariaRoleDescription,
    className,
    role,
    textElementClassName
  } = validateProps(liveRegionTwinContainerPropsSchema, props);

  const [staticElementEntries] = useStaticElementEntries();

  // We assume there is only one instance under the <LiveRegionTwinContext>.
  // The assumption made us safe to mark everything is rendered.
  // In contrary, if we have 0-to-many at different time, we may falsely mark something as rendered.
  useMarkAllAsRenderedEffect();

  return (
    <div
      aria-label={ariaLabel}
      aria-live={ariaLive}
      aria-roledescription={ariaRoleDescription}
      className={className}
      role={role}
    >
      {staticElementEntries.map(({ element, key }) => {
        if (typeof element === 'string') {
          return (
            <div aria-atomic={true} className={textElementClassName} key={key}>
              {element}
            </div>
          );
        }

        return <Fragment key={key}>{element}</Fragment>;
      })}
    </div>
  );
}

export default LiveRegionTwinContainer;
export { liveRegionTwinContainerPropsSchema, type LiveRegionTwinContainerProps };
