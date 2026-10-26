import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string } from 'valibot';

import styles from './VimeoContent.module.css';

const { useLocalizer } = hooks;

const vimeoContentPropsSchema = pipe(
  object({
    alt: optional(string()),
    autoPlay: optional(boolean()),
    embedID: string(),
    loop: optional(boolean())
  }),
  readonly()
);

type VimeoContentProps = InferReactProps<typeof vimeoContentPropsSchema>;

function VimeoContent(props: VimeoContentProps) {
  const { alt, autoPlay = false, embedID, loop = false } = validateProps(vimeoContentPropsSchema, props);

  const classNames = useStyles(styles);
  const localize = useLocalizer();

  const search = new URLSearchParams({
    autoplay: autoPlay ? '1' : '0',
    badge: '0',
    byline: '0',
    loop: loop ? '1' : '0',
    portrait: '0',
    title: '0'
  }).toString();
  const title = localize('ATTACHMENT_VIDEO');

  return (
    <iframe
      allowFullScreen={true}
      aria-label={alt}
      className={classNames['vimeo-content']}
      sandbox="allow-same-origin allow-scripts"
      src={`https://player.vimeo.com/video/${encodeURI(embedID)}?${search}`}
      title={title}
    />
  );
}

export default memo(VimeoContent);
export { vimeoContentPropsSchema, type VimeoContentProps };
