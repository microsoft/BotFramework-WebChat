/* eslint react/no-array-index-key: "off" */

import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { Children, memo } from 'react';
import { object, optional, pipe, readonly } from 'valibot';

const mediaListPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type MediaListProps = InferReactProps<typeof mediaListPropsSchema>;

/**
 * Lays out the media of a media card, such as audio or video players, one medium per item.
 *
 * Only 2 or more media are marked up as a list.
 * Screen readers would announce a single medium as "1 of 1", which is unnecessary.
 */
function MediaList(props: MediaListProps) {
  const { children } = validateProps(mediaListPropsSchema, props);

  const items = Children.toArray(children);

  const isList = items.length > 1;

  const Item = isList ? 'li' : 'div';
  const List = isList ? 'ul' : 'div';

  return (
    <List className="media-list">
      {items.map((item, index) => (
        <Item key={index}>{item}</Item>
      ))}
    </List>
  );
}

MediaList.displayName = 'MediaList';

export default memo(MediaList);
export { mediaListPropsSchema, type MediaListProps };
