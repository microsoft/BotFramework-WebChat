import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo, useCallback, type MouseEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';
import { custom, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import ItemBody from './private/ItemBody';
import extractHostnameWithSubdomain from './private/extractHostnameWithSubdomain';

import styles from './LinkDefinitions.module.css';

const linkDefinitionItemPropsSchema = pipe(
  object({
    // Displayed beneath the main link of the citation if it exists
    badgeName: optional(string()),

    // Used as a tooltip and ARIA label for the item's displayed badgeName
    badgeTitle: optional(string()),

    // The text (usually a number) displayed to the left of the item (e.g. "1")
    identifier: optional(string()),

    onClick: optional(
      custom<(event: Pick<CustomEvent, 'defaultPrevented' | 'preventDefault' | 'type'>) => void>(
        value => typeof value === 'function'
      )
    ),

    // If the citation is an external link, this is its destination.
    sanitizedHref: optional(string()),

    // The main text of the citation. This will be formatted as if it were a link. If this is nullish and a URL exists, its host will be displayed instead.
    text: optional(string())
  }),
  readonly()
);

type LinkDefinitionItemProps = InferInput<typeof linkDefinitionItemPropsSchema>;

// eslint-disable-next-line prefer-arrow-callback
const LinkDefinitionItem = memo(function LinkDefinitionItem(props: LinkDefinitionItemProps) {
  const { badgeName, badgeTitle, identifier, onClick, sanitizedHref, text } = validateProps(
    linkDefinitionItemPropsSchema,
    props
  );

  const classNames = useStyles(styles);

  const onClickRef = useRefFrom(onClick);

  const handleClick = useCallback<MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>>(
    event => {
      const { current } = onClickRef;

      if (current) {
        const customEvent = new CustomEvent('click');

        current(customEvent);

        customEvent.defaultPrevented && event.preventDefault();
      }
    },
    [onClickRef]
  );

  return sanitizedHref ? (
    // URL is sanitized.
    // eslint-disable-next-line react/forbid-elements
    <a
      className={cx(
        classNames['link-definitions__list-item-box'],
        classNames['link-definitions__list-item-box--as-link']
      )}
      href={sanitizedHref}
      onClick={handleClick}
      rel="noopener noreferrer"
      target="_blank"
    >
      <ItemBody
        badgeName={badgeName}
        badgeTitle={badgeTitle}
        identifier={identifier}
        isExternal={true}
        text={text || extractHostnameWithSubdomain(sanitizedHref)}
      />
    </a>
  ) : (
    <button
      className={cx(
        classNames['link-definitions__list-item-box'],
        classNames['link-definitions__list-item-box--as-button']
      )}
      onClick={handleClick}
      type="button"
    >
      <ItemBody badgeName={badgeName} badgeTitle={badgeTitle} identifier={identifier} text={text} />
    </button>
  );
});

export default LinkDefinitionItem;
export { linkDefinitionItemPropsSchema, type LinkDefinitionItemProps };
