import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import React, { Fragment, memo, useEffect, useMemo } from 'react';
import { wrapWith } from 'react-wrap-with';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import createStateContextWithHook from './private/createStateContextWithHook';
import useGetterState from './private/useGetterState';

const clipboardWritePermissionComposerPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ClipboardWritePermissionComposerProps = InferInput<typeof clipboardWritePermissionComposerPropsSchema>;

const { Composer: PermissionGrantedComposer, useValue: usePermissionGranted } =
  createStateContextWithHook<boolean>(false);

function useClipboardWritePermissionHooks(): Readonly<{
  usePermissionGranted: () => readonly [boolean];
}> {
  const usePermissionGranted_ = useGetterState(usePermissionGranted());

  return useMemo(() => Object.freeze({ usePermissionGranted: usePermissionGranted_ }), [usePermissionGranted_]);
}

function ClipboardWritePermissionComposer_(props: ClipboardWritePermissionComposerProps) {
  const { children } = validateProps(clipboardWritePermissionComposerPropsSchema, props);

  const [_, setPermissionGranted] = usePermissionGranted();

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

  return <Fragment>{children}</Fragment>;
}

const ClipboardWritePermissionComposer = wrapWith(PermissionGrantedComposer)(memo(ClipboardWritePermissionComposer_));

export default memo(ClipboardWritePermissionComposer);
export { useClipboardWritePermissionHooks };
