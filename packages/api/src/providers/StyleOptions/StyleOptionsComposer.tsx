import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import { custom, is, object, optional, pipe, readonly, type InferInput } from 'valibot';

import { type StyleOptions } from '../../StyleOptions';
import StyleOptionsContext, { StyleOptionsContextType, useStyleOptionsContext } from './private/StyleOptionsContext';
import rectifyStyleOptions from './private/rectifyStyleOptions';

const styleOptionsComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    styleOptions: optional(custom<StyleOptions>(value => is(object({}), value)))
  }),
  readonly()
);

type StyleOptionsComposerProps = InferInput<typeof styleOptionsComposerPropsSchema>;

function StyleOptionsComposer(props: StyleOptionsComposerProps) {
  const { children, styleOptions } = validateProps(styleOptionsComposerPropsSchema, props);

  const {
    styleOptionsState: [currentStyleOptionsState]
  } = useStyleOptionsContext();

  const context = useMemo<Readonly<StyleOptionsContextType>>(
    () =>
      Object.freeze({
        styleOptionsState: Object.freeze([
          Object.freeze(
            rectifyStyleOptions({
              ...currentStyleOptionsState,
              ...styleOptions
            })
          )
        ] as const)
      }),
    [currentStyleOptionsState, styleOptions]
  );

  return <StyleOptionsContext.Provider value={context}>{children}</StyleOptionsContext.Provider>;
}

StyleOptionsComposer.displayName = 'StyleOptionsComposer';

export default memo(StyleOptionsComposer);
