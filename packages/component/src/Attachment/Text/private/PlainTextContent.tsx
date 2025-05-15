import { validateProps } from 'botframework-webchat-api/internal';
import classNames from 'classnames';
import React, { Fragment, memo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleSet from '../../../hooks/useStyleSet';
import reactNode from '../../../types/internal/reactNode';

const plainTextContentPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    text: string()
  }),
  readonly()
);

type PlainTextContentProps = InferInput<typeof plainTextContentPropsSchema>;

function PlainTextContent(props: PlainTextContentProps) {
  const { children, text } = validateProps(plainTextContentPropsSchema, props);

  const [{ textContent: textContentStyleSet }] = useStyleSet();

  return (
    <Fragment>
      {(text || '').split('\n').map(line => (
        <p
          className={classNames('webchat__text-content', 'webchat__text-content--is-plain', textContentStyleSet + '')}
          key={line}
        >
          {line.trim()}
        </p>
      ))}
      {children && (
        <div
          className={classNames('webchat__text-content', 'webchat__text-content--children', textContentStyleSet + '')}
        >
          {children}
        </div>
      )}
    </Fragment>
  );
}

export default memo(PlainTextContent);
export { plainTextContentPropsSchema, type PlainTextContentProps };
