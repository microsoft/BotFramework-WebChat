import { createBitContext, useReadonlyState, useStableStateHook } from 'botframework-webchat-react-context';
import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import React, {
  createContext,
  memo,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction
} from 'react';
import { wrapWith } from 'react-wrap-with';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

declare const WEBCHAT_PERF_CONTEXT: 'bit ocontext' | 'stable state';

const clipboardWritePermissionComposerPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ClipboardWritePermissionComposerProps = InferInput<typeof clipboardWritePermissionComposerPropsSchema>;

type ClipboardWritePermissionContextType = Readonly<{
  usePermissionGranted: () => readonly [boolean];
}>;

const ClipboardWritePermissionContext = createContext<ClipboardWritePermissionContextType>(
  new Proxy({} as any, {
    get() {
      throw new Error('botframework-webchat: This hook can only bs used under <ClipboardWritePermissionComposer>');
    }
  })
);

const { Composer: PermissionGrantedComposer, useState: usePermissionGrantedFromBit } = createBitContext<boolean>(false);

function ClipboardWritePermissionComposer(props: ClipboardWritePermissionComposerProps) {
  const { children } = validateProps(clipboardWritePermissionComposerPropsSchema, props);

  let setPermissionGranted: Dispatch<SetStateAction<boolean>>;
  let usePermissionGranted: () => readonly [boolean];

  if (WEBCHAT_PERF_CONTEXT === 'stable state') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [permissionGranted, setPermissionGrantedFromState] = useState(false);

    setPermissionGranted = setPermissionGrantedFromState;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    usePermissionGranted = useStableStateHook(permissionGranted);
  } else {
    // eslint-disable-next-line prefer-destructuring, react-hooks/rules-of-hooks
    setPermissionGranted = usePermissionGrantedFromBit()[1];
    // eslint-disable-next-line react-hooks/rules-of-hooks
    usePermissionGranted = useReadonlyState(usePermissionGrantedFromBit());
  }

  const context = useMemo<ClipboardWritePermissionContextType>(
    () =>
      Object.freeze({
        usePermissionGranted
      }),
    [usePermissionGranted]
  );

  useEffect(() => {
    let unmounted = false;

    (async () => {
      if ((await navigator.permissions.query({ name: 'clipboard-write' as any })).state === 'granted') {
        unmounted || setPermissionGranted(true);
      }
    })();

    return () => {
      unmounted = true;
    };
  }, [setPermissionGranted]);

  return (
    <ClipboardWritePermissionContext.Provider value={context}>{children}</ClipboardWritePermissionContext.Provider>
  );
}

function useClipboardWritePermissionHooks(): Readonly<{
  usePermissionGranted(): readonly [boolean];
}> {
  return useContext(ClipboardWritePermissionContext);
}

export default memo(
  WEBCHAT_PERF_CONTEXT === 'stable state'
    ? ClipboardWritePermissionComposer
    : wrapWith(PermissionGrantedComposer)(memo(ClipboardWritePermissionComposer))
);

export { useClipboardWritePermissionHooks };
