import React, {
  ReactNode,
  RefObject,
  createContext,
  createRef,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import { useRefFrom } from 'use-ref-from';

const stylesRootContext = createContext<RefObject<Node>>(createRef());

export const StylesRootProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
  const [childEl, setChildEl] = useState<HTMLSpanElement>(null);
  const childElRef = useRefFrom(childEl);
  const stylesRoot = useMemo<Node>(() => {
    const documentOrShadowRoot = childEl?.getRootNode();
    return documentOrShadowRoot && documentOrShadowRoot instanceof Document
      ? (documentOrShadowRoot.head as Node)
      : documentOrShadowRoot;
  }, [childEl]);
  const stylesRootRef = useRefFrom(stylesRoot);

  const childElCallbackRef = useCallback(
    (el: HTMLSpanElement) => el && childElRef.current !== el && setChildEl(el),
    [setChildEl, childElRef]
  );

  return (
    <stylesRootContext.Provider value={stylesRootRef}>
      {childEl ? children : <span hidden={true} ref={childElCallbackRef} />}
    </stylesRootContext.Provider>
  );
};

export function useStylesRoot() {
  return useContext(stylesRootContext).current;
}
