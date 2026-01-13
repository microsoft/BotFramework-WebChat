import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { type OrgSchemaProject } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo } from 'react';
import { custom, object, optional, pipe, readonly, safeParse, string, type InferInput } from 'valibot';

import useSanitizeHrefCallback from '../../hooks/internal/useSanitizeHrefCallback';

import styles from '../ActivityStatus.module.css';

const originatorPropsSchema = pipe(
  object({
    // TODO: [P1] We should build this schema into `OrgSchemaProject` instead, or build a Schema.org query library.
    project: custom<OrgSchemaProject>(
      value =>
        safeParse(
          object({
            name: optional(string()),
            slogan: optional(string()),
            url: optional(string())
          }),
          value
        ).success
    )
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

  const { sanitizedHref } = sanitizeHref(url);
  const text = slogan || name;

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
