import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { orgSchemaProjectSchema } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo } from 'react';
import { object, pipe, readonly, type InferInput } from 'valibot';

import useSanitizeHrefCallback from '../../hooks/internal/useSanitizeHrefCallback';

import styles from '../ActivityStatus.module.css';

const originatorPropsSchema = pipe(
  object({
    project: orgSchemaProjectSchema
  }),
  readonly()
);

type OriginatorProps = InferInput<typeof originatorPropsSchema>;

// Regular function is better for React function component.
// eslint-disable-next-line prefer-arrow-callback
const Originator = memo(function Originator(props: OriginatorProps) {
  const {
    project: { name, slogan, url }
  } = validateProps(originatorPropsSchema, props);

  const sanitizeHref = useSanitizeHrefCallback();
  const classNames = useStyles(styles);

  const { sanitizedHref } = sanitizeHref(url[0]);
  const text = slogan[0] || name[0];

  return sanitizedHref ? (
    // Link is sanitized.
    // eslint-disable-next-line react/forbid-elements
    <a
      className={cx(classNames['activity-status__originator'], classNames['activity-status__originator--has-link'])}
      href={sanitizedHref}
      rel="noopener noreferrer"
      target="_blank"
    >
      {text}
    </a>
  ) : (
    <span className={classNames['activity-status__originator']}>{text}</span>
  );
});

export default Originator;
export { originatorPropsSchema, type OriginatorProps };
