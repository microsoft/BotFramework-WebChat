import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import random from 'math-random';
import React, { memo, ReactEventHandler, useCallback, useRef, useState } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { ComponentIcon } from '../Icon';
import styles from './CollapsibleContent.module.css';

const collapsibleContentPropsSchema = pipe(
  object({
    children: reactNode(),
    summary: reactNode(),
    summaryClassName: optional(string())
  }),
  readonly()
);

type CollapsibleContentProps = InferInput<typeof collapsibleContentPropsSchema>;

function uniqueId(count = Infinity) {
  return (
    random()
      // eslint-disable-next-line no-magic-numbers
      .toString(36)
      // eslint-disable-next-line no-magic-numbers
      .substring(2, 2 + count)
  );
}

function CollapsibleContent(props: CollapsibleContentProps) {
  const { children, summary, summaryClassName } = validateProps(collapsibleContentPropsSchema, props);
  const [id] = useState(() => `webchat-collapsible-content-${uniqueId()}`);
  const classNames = useStyles(styles);
  const summaryRef = useRef<HTMLElement>(null);

  const handleToggle = useCallback<ReactEventHandler<HTMLDetailsElement>>(event => {
    const summary = summaryRef.current;
    const details = event.target;
    if (summary && details && details instanceof HTMLDetailsElement) {
      const isDetailsOpen = details.open.toString();
      summary.setAttribute('aria-expanded', isDetailsOpen);
      summary.setAttribute('aria-pressed', isDetailsOpen);
    }
  }, []);

  return (
    // eslint-disable-next-line react/forbid-dom-props
    <details className={cx(classNames['collapsible-content'])} id={id} onToggle={handleToggle}>
      <summary
        aria-controls={id}
        aria-expanded="false"
        aria-pressed="false"
        className={cx(classNames['collapsible-content__summary'], summaryClassName)}
        ref={summaryRef}
        role="button"
      >
        {summary && <span className={classNames['collapsible-content__summary-text']}>{summary}</span>}
        <ComponentIcon appearance="text" className={classNames['collapsible-content__chevron']} icon="chevron" />
      </summary>
      <div className={classNames['collapsible-content__content']}>{children}</div>
    </details>
  );
}

export default memo(CollapsibleContent);
export { collapsibleContentPropsSchema, type CollapsibleContentProps };
