// import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import { validateProps } from 'botframework-webchat-api/internal';
import React, { Fragment, memo, useCallback, useEffect, useMemo } from 'react';
import { wrapWith } from 'react-wrap-with';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import reactNode from '../../types/internal/reactNode';
import createStateContextWithHook from './private/createStateContextWithHook';

const clipboardWritePermissionComposerPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ClipboardWritePermissionComposerProps = InferInput<typeof clipboardWritePermissionComposerPropsSchema>;

const { Composer: PermissionGrantedComposer, useValue: useRawPermissionGranted } =
  createStateContextWithHook<boolean>(false);

function useClipboardWritePermissionHooks(): Readonly<{
  usePermissionGranted: () => readonly [boolean];
}> {
  const [permissionGranted] = useRawPermissionGranted();

  const usePermissionGranted = useCallback(() => Object.freeze([permissionGranted] as const), [permissionGranted]);

  const hooks = useMemo(() => Object.freeze({ usePermissionGranted }), [usePermissionGranted]);

  return hooks;
}

function ClipboardWritePermissionComposer_(props: ClipboardWritePermissionComposerProps) {
  const { children } = validateProps(clipboardWritePermissionComposerPropsSchema, props);

  const [_, setPermissionGranted] = useRawPermissionGranted();

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
