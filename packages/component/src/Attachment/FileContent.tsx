import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { Fragment, memo } from 'react';
import { boolean, number, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleSet from '../hooks/useStyleSet';
import { ComponentIcon } from '../Icon';

import styles from './FileContent.module.css';

const { useByteFormatter, useDirection, useLocalizer } = hooks;

// TODO: Consider using `useSanitizeHrefCallback`, which underlying use `sanitize-html` or whatever in HTML content transformer.
const ALLOWED_PROTOCOLS = ['blob:', 'data:', 'http:', 'https:'];

function isAllowedProtocol(url) {
  try {
    return ALLOWED_PROTOCOLS.includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

const fileContentBadgePropsSchema = pipe(
  object({
    downloadIcon: optional(boolean()),
    fileName: string(),
    size: optional(number())
  }),
  readonly()
);

type FileContentBadgeProps = InferInput<typeof fileContentBadgePropsSchema>;

const FileContentBadge = (props: FileContentBadgeProps) => {
  const { downloadIcon = false, fileName, size } = validateProps(fileContentBadgePropsSchema, props);

  // Keeps the "webchat__fileContent" class names.
  const classNames = useStyles(styles, webChatPrefixedClassName);
  const [direction] = useDirection();
  const formatByte = useByteFormatter();

  const localizedSize = typeof size === 'number' && formatByte(size);

  return (
    <Fragment>
      <div aria-hidden={true} className={classNames['fileContent__badge']}>
        <div className={classNames['fileContent__fileName']}>{fileName}</div>
        {!!localizedSize && <div className={classNames['fileContent__size']}>{localizedSize}</div>}
      </div>
      {downloadIcon && (
        <ComponentIcon
          appearance="text"
          className={cx(
            classNames['fileContent__downloadIcon'],
            // The "fileContent" style set entry, which applies the style options, selects this modifier.
            direction === 'rtl' && 'webchat__fileContent__downloadIcon--rtl'
          )}
          icon="download"
        />
      )}
    </Fragment>
  );
};

type FileContentProps = InferInput<typeof fileContentPropsSchema>;

const fileContentPropsSchema = pipe(
  object({
    className: optional(string()),
    fileName: string(),
    href: optional(string()),
    size: optional(number())
  }),
  readonly()
);

function FileContent(props: FileContentProps) {
  const { className, href, fileName, size } = validateProps(fileContentPropsSchema, props);

  // Keeps the "webchat__fileContent" class names.
  const classNames = useStyles(styles, webChatPrefixedClassName);
  const [{ fileContent: fileContentStyleSet }] = useStyleSet();
  const localize = useLocalizer();
  const localizeBytes = useByteFormatter();

  const localizedSize = typeof size === 'number' && localizeBytes(size);

  const sanitizedHref = href && isAllowedProtocol(href) ? href : undefined;

  const alt = localize(
    sanitizedHref
      ? localizedSize
        ? 'FILE_CONTENT_DOWNLOADABLE_WITH_SIZE_ALT'
        : 'FILE_CONTENT_DOWNLOADABLE_ALT'
      : localizedSize
        ? 'FILE_CONTENT_WITH_SIZE_ALT'
        : 'FILE_CONTENT_ALT',
    fileName,
    localizedSize
  );

  return (
    <div className={cx(classNames['fileContent'], fileContentStyleSet + '', className)}>
      {sanitizedHref ? (
        // URL is sanitized.
        // eslint-disable-next-line react/forbid-elements
        <a
          aria-label={alt}
          className={classNames['fileContent__buttonLink']}
          download={fileName}
          href={sanitizedHref}
          rel="noopener noreferrer"
          target="_blank"
        >
          <FileContentBadge downloadIcon={true} fileName={fileName} size={size} />
        </a>
      ) : (
        <FileContentBadge downloadIcon={false} fileName={fileName} size={size} />
      )}
    </div>
  );
}

export default memo(FileContent);
export { fileContentPropsSchema, type FileContentProps };
