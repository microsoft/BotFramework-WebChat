import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { Fragment, useEffect, useRef } from 'react';
import { instance, is, literal, nullable, object, optional, picklist, pipe, readonly, string, union } from 'valibot';

import refObject from '../../../types/internal/refObject';
import getAnnouncementText from './getAnnouncementText';
import { ariaNotifiableSchema } from './isAriaNotifySupported';
import useMarkAllAsRenderedEffect from './useMarkAllAsRenderedEffect';
import useStaticElementEntries from './useStaticElementEntries';

const liveRegionTwinContainerPropsSchema = pipe(
  object({
    'aria-label': optional(string()),
    'aria-live': union([literal('assertive'), literal('polite')]),
    'aria-roledescription': optional(string()),
    ariaNotifyTargetRef: refObject(nullable(instance(HTMLElement))),
    className: optional(string()),
    role: optional(string()),
    textElementClassName: optional(string()),
    // `'aria-notify'` only when the browser supports `ariaNotify()`.
    transport: picklist(['aria-notify', 'live-region'])
  }),
  readonly()
);

type LiveRegionTwinContainerProps = InferReactProps<typeof liveRegionTwinContainerPropsSchema>;

// This container is marked as private because we assume there is only one instance under the <LiveRegionTwinContext>.
function LiveRegionTwinContainer(props: LiveRegionTwinContainerProps) {
  const {
    'aria-label': ariaLabel,
    'aria-live': ariaLive,
    'aria-roledescription': ariaRoleDescription,
    ariaNotifyTargetRef,
    className,
    role,
    textElementClassName,
    transport
  } = validateProps(liveRegionTwinContainerPropsSchema, props);

  const [staticElementEntries] = useStaticElementEntries();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSeenKeyRef = useRef(0);

  // We assume there is only one instance under the <LiveRegionTwinContext>.
  // The assumption made us safe to mark everything is rendered.
  // In contrary, if we have 0-to-many at different time, we may falsely mark something as rendered.
  useMarkAllAsRenderedEffect();

  // Keys are increasing: entries with a key above the last seen one are new, in queue order, and are notified once, also when React runs effects twice.
  // Entries are marked as seen in both transports, so switching to `ariaNotify()` does not repeat what the live region has read.
  useEffect(() => {
    const { current: target } = ariaNotifyTargetRef;

    staticElementEntries.forEach(({ key }, index) => {
      if (key > lastSeenKeyRef.current) {
        lastSeenKeyRef.current = key;

        if (transport === 'aria-notify') {
          // When notifying, every entry is rendered in its own element, in queue order.
          const text = getAnnouncementText(containerRef.current.children.item(index));

          text && is(ariaNotifiableSchema, target) && target.ariaNotify(text, { priority: 'normal' });
        }
      }
    });
  }, [ariaNotifyTargetRef, staticElementEntries, transport]);

  // When notifying, entries are only rendered to compute their text, and removed right after: the container has no live semantics and is hidden from screen readers, so each entry is announced once.
  return (
    <div
      aria-hidden={transport === 'aria-notify' || undefined}
      aria-label={ariaLabel}
      aria-live={transport === 'aria-notify' ? undefined : ariaLive}
      aria-roledescription={ariaRoleDescription}
      className={className}
      ref={containerRef}
      role={role}
    >
      {staticElementEntries.map(({ element, key }) =>
        transport === 'aria-notify' ? (
          <div key={key}>{element}</div>
        ) : typeof element === 'string' ? (
          <div aria-atomic={true} className={textElementClassName} key={key}>
            {element}
          </div>
        ) : (
          <Fragment key={key}>{element}</Fragment>
        )
      )}
    </div>
  );
}

export default LiveRegionTwinContainer;
export { liveRegionTwinContainerPropsSchema, type LiveRegionTwinContainerProps };
