import { useEffect } from 'react';

import useLiveRegionTwinContext from './useContext';

// After calling `markAllAsRendered`, it will cause a re-render.
// Since `markAllAsRendered` is a converging function, it will eventually stop re-rendering.
// We call this hook `useXXXEffect` for us to abstract the business logic here.
export default function useMarkAllAsRenderedEffect(): void {
  const { markAllAsRendered } = useLiveRegionTwinContext();

  // We did not set the `deps` argument as we want to run this function on every render.
  useEffect(markAllAsRendered);
}
