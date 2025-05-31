import { createBitContext, useReadonlyState } from 'botframework-webchat-react-context';
import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import React, { Fragment, memo, useEffect, useMemo } from 'react';
import { wrapWith } from 'react-wrap-with';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

const clipboardWritePermissionComposerPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ClipboardWritePermissionComposerProps = InferInput<typeof clipboardWritePermissionComposerPropsSchema>;

const { Composer: PermissionGrantedComposer, useState: usePermissionGranted } = createBitContext<boolean>(false);

function useClipboardWritePermissionHooks(): Readonly<{
  usePermissionGranted: () => readonly [boolean];
}> {
  const usePermissionGranted_ = useReadonlyState(usePermissionGranted());

  return useMemo(
    () =>
      Object.freeze({
        usePermissionGranted: usePermissionGranted_
      }),
    [usePermissionGranted_]
  );
}

function ClipboardWritePermissionComposer(props: ClipboardWritePermissionComposerProps) {
  const { children } = validateProps(clipboardWritePermissionComposerPropsSchema, props);

  const [_, setPermissionGranted] = usePermissionGranted();

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

  return <Fragment>{children}</Fragment>;
}

export default memo(wrapWith(PermissionGrantedComposer)(memo(ClipboardWritePermissionComposer)));
export { useClipboardWritePermissionHooks };
