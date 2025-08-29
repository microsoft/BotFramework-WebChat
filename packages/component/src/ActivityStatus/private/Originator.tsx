import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { type OrgSchemaProject } from 'botframework-webchat-core';
import React, { memo } from 'react';
import { custom, object, optional, pipe, readonly, safeParse, string, type InferInput } from 'valibot';

import useSanitizeHrefCallback from '../../hooks/internal/useSanitizeHrefCallback';

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

const Originator = memo((props: OriginatorProps) => {
  const {
    project: { name, slogan, url }
  } = validateProps(originatorPropsSchema, props);

  const sanitizeHref = useSanitizeHrefCallback();

  const { sanitizedHref } = sanitizeHref(url);
  const text = slogan || name;

  return sanitizedHref ? (
    // Link is sanitized.
    // eslint-disable-next-line react/forbid-elements
    <a
      className="webchat__activity-status__originator webchat__activity-status__originator--has-link"
      href={sanitizedHref}
      rel="noopener noreferrer"
      target="_blank"
    >
      {text}
    </a>
  ) : (
    <span className="webchat__activity-status__originator">{text}</span>
  );
});

Originator.displayName = 'Originator';

export default Originator;
export { originatorPropsSchema, type OriginatorProps };
