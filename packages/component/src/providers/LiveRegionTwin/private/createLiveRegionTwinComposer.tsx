import { hooks } from 'botframework-webchat-api';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState, type Context, type ReactNode } from 'react';
import { useRefFrom } from 'use-ref-from';

import { type LiveRegionTwinContextType } from './LiveRegionTwinComposer';
import LiveRegionTwinContainer from './LiveRegionTwinContainer';

import type { StaticElement, StaticElementEntry } from './types';

const { usePonyfill } = hooks;

const DEFAULT_ARIA_LIVE = 'polite';
const DEFAULT_FADE_AFTER = 1000;

type LiveRegionTwinComposerProps = Readonly<{
  /** Optional "aria-label" attribute for the live region twin container. */
  'aria-label'?: string;

  /** "aria-live" attribute for the live region twin container, defaults to `'polite'`. */
  'aria-live'?: 'assertive' | 'polite';

  /** Optional "aria-roledescription" attribute for the live region twin container. */
  'aria-roledescription'?: string;

  /** Optional "className" attribute for the live region twin container. */
  className?: string;

  /**
   * Static elements will fade out after this timeout value specified in milliseconds, defaults to `1000`.
   *
   * When lowering this value, make sure screen reader can continue to pick up new static elements before fading out.
   *
   * If this prop is updated, it will be reflected in next queueing elements.
   */
  fadeAfter?: number;

  /** Optional "role" attribute for the live region twin container. */
  role?: string;

  /** Optional "className" attribute for static text element. */
  textElementClassName?: string;

  children?: ReactNode | undefined;
}>;

/**
 * Live region twin is an UI component for queueing texts or elements to the screen reader using
 * a container element with `aria-live` attribute set.
 *
 * After the text is rendered and queued, it will be removed to reduce burden on the DOM tree.
 * Currently, we assume the assistive technologies should pick up the text within 1 second of rendering.
 * This value is configurable.
 *
 * By default, the live region is visible. If is is not desirable, the caller can use `className` prop to
 * hide its visuals.
 */
const createLiveRegionTwinComposer = ({ Provider }: Context<LiveRegionTwinContextType>) => {
  const LiveRegionTwinComposer = ({
    'aria-label': ariaLabel,
    'aria-live': ariaLive = DEFAULT_ARIA_LIVE,
    'aria-roledescription': ariaRoleDescription,
    children,
    className,
    fadeAfter = DEFAULT_FADE_AFTER,
    role,
    textElementClassName
  }: LiveRegionTwinComposerProps) => {
    const [{ clearTimeout, setTimeout }] = usePonyfill();
    const [staticElementEntries, setStaticElementEntries] = useState<StaticElementEntry[]>([]);
    const fadeAfterRef = useRefFrom(fadeAfter);
    const markAllAsRenderedTimeoutIdRef = useRef<any>();
    const nextKeyRef = useRef<number>(1);

    const staticElementEntriesRef = useRefFrom(staticElementEntries);

    // This function is called by an effect hook `useMarkAllAsRenderedEffect`, it must be designed with converging in mind.
    // To prevent infinite render loop, after multiple calls to this function, it should eventually no-op.
    const markAllAsRendered = useCallback<() => void>(() => {
      if (!staticElementEntriesRef.current.length) {
        // Nothing to remove.
        return;
      }

      // When removing each element one-by-one based on an individual timeout, Narrator would narrate them twice occasionally.
      // Possibly it think some elements that is not removed during the current cycle, are new elements and queued them twice.
      // Thus, we are removing all at once to prevent bugs in Narrator.
      markAllAsRenderedTimeoutIdRef.current && clearTimeout(markAllAsRenderedTimeoutIdRef.current);

      markAllAsRenderedTimeoutIdRef.current = setTimeout(() => {
        // We are playing safe by using value ref to check its length here.
        // If we are certain that `setStaticElements(emptyArray => emptyArray)` is a no-op,
        // we could replace it with just the setter function.
        staticElementEntriesRef.current.length && setStaticElementEntries([]);
      }, fadeAfterRef.current);
    }, [
      clearTimeout,
      fadeAfterRef,
      markAllAsRenderedTimeoutIdRef,
      setStaticElementEntries,
      setTimeout,
      staticElementEntriesRef
    ]);

    // When this component is unmounting, make sure all future `setTimeout` are cleared and should not be fired.
    useEffect(
      () => () => markAllAsRenderedTimeoutIdRef.current && clearTimeout(markAllAsRenderedTimeoutIdRef.current),
      [clearTimeout, markAllAsRenderedTimeoutIdRef]
    );

    const queueStaticElement = useCallback<(staticElement: StaticElement) => void>(
      (element: StaticElement): void => {
        const key = nextKeyRef.current;

        nextKeyRef.current = nextKeyRef.current + 1;

        setStaticElementEntries(entries => [...entries, { element, key }]);
      },
      [nextKeyRef, setStaticElementEntries]
    );

    const staticElementEntriesState = useMemo<readonly [readonly StaticElementEntry[]]>(
      () => Object.freeze([Object.freeze(staticElementEntries)]) as readonly [readonly StaticElementEntry[]],
      [staticElementEntries]
    );

    const context = useMemo(
      () => ({
        markAllAsRendered,
        queueStaticElement,
        staticElementEntriesState
      }),
      [markAllAsRendered, queueStaticElement, staticElementEntriesState]
    );

    return (
      <Provider value={context}>
        <LiveRegionTwinContainer
          aria-label={ariaLabel}
          aria-live={ariaLive}
          aria-roledescription={ariaRoleDescription}
          className={className}
          role={role}
          textElementClassName={textElementClassName}
        />
        {children}
      </Provider>
    );
  };

  LiveRegionTwinComposer.displayName = 'LiveRegionTwinComposer';

  return memo(LiveRegionTwinComposer);
};

export default createLiveRegionTwinComposer;
