import { useStableStateHook } from 'botframework-webchat-react-context';
import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import React, { createContext, memo, useContext, useEffect, useMemo, useState } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

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

const ClipboardWritePermissionContext = createContext<ClipboardWritePermissionContextType>({} as any);

function ClipboardWritePermissionComposer(props: ClipboardWritePermissionComposerProps) {
  const { children } = validateProps(clipboardWritePermissionComposerPropsSchema, props);

  const [permissionGranted, setPermissionGranted] = useState(false);

  const usePermissionGranted = useStableStateHook(permissionGranted);

  const context = useMemo<ClipboardWritePermissionContextType>(
    () =>
      Object.freeze({
        usePermissionGranted
      }),
    [usePermissionGranted]
  );

  useEffect(() => {
    let unmounted = false;

    (async function () {
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

export default memo(ClipboardWritePermissionComposer);
export { useClipboardWritePermissionHooks };
