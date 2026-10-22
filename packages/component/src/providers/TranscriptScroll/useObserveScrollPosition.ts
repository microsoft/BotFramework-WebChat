import { useObserveScrollPosition as useReactScrollToBottomObserveScrollPosition } from 'react-scroll-to-bottom';

/** Calls the observer on every handled scroll event of the transcript. */
export default function useObserveScrollPosition(
  observer: (position: { readonly scrollTop: number }) => void,
  deps?: readonly unknown[] | undefined
): void {
  useReactScrollToBottomObserveScrollPosition(observer, deps);
}
