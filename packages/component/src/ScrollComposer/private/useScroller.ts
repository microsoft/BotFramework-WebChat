import { useCallback } from 'react';
import type { ActivityElementMap } from '../../Transcript/types';
import type { MutableRefObject } from 'react';
import useValueRef from '../../hooks/internal/useValueRef';
import { hooks } from 'botframework-webchat-api';

const { useActivityKeys, useLastAcknowledgedActivityKey, useStyleOptions } = hooks;

export type Scroller = ({ offsetHeight, scrollTop }: { offsetHeight: number; scrollTop: number }) => number;

// "scroller" is the auto-scroll limiter, a.k.a. auto scroll snap.
const useScroller = (activityElementMapRef: MutableRefObject<ActivityElementMap>): Scroller => {
  const [activityKeys] = useActivityKeys();
  const [lastAcknowledgedActivityKey] = useLastAcknowledgedActivityKey();
  const [styleOptions] = useStyleOptions();

  const activityKeysRef = useValueRef(activityKeys);
  const lastAcknowledgedActivityKeyRef = useValueRef(lastAcknowledgedActivityKey);
  const styleOptionsRef = useValueRef(styleOptions);

  return useCallback(
    ({ offsetHeight, scrollTop }) => {
      const {
        current: {
          autoScrollSnapOnActivity,
          autoScrollSnapOnActivityOffset,
          autoScrollSnapOnPage,
          autoScrollSnapOnPageOffset
        }
      } = styleOptionsRef;

      const patchedAutoScrollSnapOnActivity =
        typeof autoScrollSnapOnActivity === 'number'
          ? Math.max(0, autoScrollSnapOnActivity)
          : autoScrollSnapOnActivity
            ? 1
            : 0;
      const patchedAutoScrollSnapOnPage =
        typeof autoScrollSnapOnPage === 'number'
          ? Math.max(0, Math.min(1, autoScrollSnapOnPage))
          : autoScrollSnapOnPage
            ? 1
            : 0;
      const patchedAutoScrollSnapOnActivityOffset =
        typeof autoScrollSnapOnActivityOffset === 'number' ? autoScrollSnapOnActivityOffset : 0;
      const patchedAutoScrollSnapOnPageOffset =
        typeof autoScrollSnapOnPageOffset === 'number' ? autoScrollSnapOnPageOffset : 0;

      if (patchedAutoScrollSnapOnActivity || patchedAutoScrollSnapOnPage) {
        const { current: activityElementMap } = activityElementMapRef;
        const { current: activityKeys } = activityKeysRef;
        const { current: lastAcknowledgedActivityKey } = lastAcknowledgedActivityKeyRef;
        const values: number[] = [];

        const lastAcknowledgedActivityKeyIndex = activityKeys.indexOf(lastAcknowledgedActivityKey);

        if (~lastAcknowledgedActivityKeyIndex) {
          // The activity that we acknowledged could be not rendered, such as post back activity.
          // When calculating scroll snap, we can only base on the first unacknowledged-and-rendering activity.
          const renderingActivityKeys = Array.from(activityElementMap.keys());
          let firstUnacknowledgedActivityElementIndex = -1;

          for (const acknowledgedActivityKey of activityKeys.slice(0, lastAcknowledgedActivityKeyIndex + 1).reverse()) {
            const index = renderingActivityKeys.indexOf(acknowledgedActivityKey);

            if (~index) {
              if (index !== renderingActivityKeys.length - 1) {
                firstUnacknowledgedActivityElementIndex = index + 1;
              }

              break;
            }
          }

          if (~firstUnacknowledgedActivityElementIndex) {
            const activityElements = Array.from(activityElementMap.values());

            if (patchedAutoScrollSnapOnActivity) {
              // Gets the activity element which we should snap to.
              const nthUnacknowledgedActivityElement =
                activityElements[firstUnacknowledgedActivityElementIndex + patchedAutoScrollSnapOnActivity - 1];

              if (nthUnacknowledgedActivityElement) {
                const nthUnacknowledgedActivityBoundingBoxElement = nthUnacknowledgedActivityElement?.querySelector(
                  '.webchat__basic-transcript__activity-active-descendant'
                ) as HTMLElement;
                const nthUnacknowledgedActivityOffsetTop =
                  nthUnacknowledgedActivityElement.offsetTop + nthUnacknowledgedActivityBoundingBoxElement.offsetTop;

                values.push(
                  nthUnacknowledgedActivityOffsetTop +
                    nthUnacknowledgedActivityBoundingBoxElement.offsetHeight -
                    offsetHeight -
                    scrollTop +
                    patchedAutoScrollSnapOnActivityOffset
                );
              }
            }

            if (patchedAutoScrollSnapOnPage) {
              const firstUnacknowledgedActivityElement = activityElements[+firstUnacknowledgedActivityElementIndex];
              const firstUnacknowledgedActivityBoundingBoxElement = firstUnacknowledgedActivityElement.querySelector(
                '.webchat__basic-transcript__activity-active-descendant'
              ) as HTMLElement;
              const firstUnacknowledgedActivityOffsetTop =
                firstUnacknowledgedActivityElement.offsetTop + firstUnacknowledgedActivityBoundingBoxElement.offsetTop;

              values.push(
                firstUnacknowledgedActivityOffsetTop -
                  scrollTop -
                  offsetHeight * (1 - patchedAutoScrollSnapOnPage) +
                  patchedAutoScrollSnapOnPageOffset
              );
            }
          }
        }

        return Math.min(...values);
      }

      return Infinity;
    },
    [activityElementMapRef, activityKeysRef, lastAcknowledgedActivityKeyRef, styleOptionsRef]
  );
};

export default useScroller;