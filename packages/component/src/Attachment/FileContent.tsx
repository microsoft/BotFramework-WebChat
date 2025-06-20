import { hooks } from 'botframework-webchat-api';
import { validateProps } from 'botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { memo } from 'react';
import { boolean, number, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import useStyleSet from '../hooks/useStyleSet';
import { ComponentIcon } from '../Icon';

const { useByteFormatter, useDirection, useLocalizer } = hooks;

const ROOT_STYLE = {
  display: 'flex',

  '& .webchat__fileContent__buttonLink': {
    display: 'flex',
    flex: 1
  },

  '& .webchat__fileContent__badge': {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
};

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

  const [direction] = useDirection();
  const formatByte = useByteFormatter();

  const localizedSize = typeof size === 'number' && formatByte(size);

  return (
    <React.Fragment>
      <div aria-hidden={true} className="webchat__fileContent__badge">
        <div className="webchat__fileContent__fileName">{fileName}</div>
        {!!localizedSize && <div className="webchat__fileContent__size">{localizedSize}</div>}
      </div>
      {downloadIcon && (
        <ComponentIcon
          appearance="text"
          className={classNames(
            'webchat__fileContent__downloadIcon',
            direction === 'rtl' && 'webchat__fileContent__downloadIcon--rtl'
          )}
          icon="download"
        />
      )}
    </React.Fragment>
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

  const [{ fileContent: fileContentStyleSet }] = useStyleSet();
  const localize = useLocalizer();
  const localizeBytes = useByteFormatter();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  const localizedSize = typeof size === 'number' && localizeBytes(size);

  const allowedHref = href && isAllowedProtocol(href) ? href : undefined;

  const alt = localize(
    allowedHref
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
    <div className={classNames('webchat__fileContent', rootClassName, fileContentStyleSet + '', className)}>
      {allowedHref ? (
        <a
          aria-label={alt}
          className="webchat__fileContent__buttonLink"
          download={fileName}
          href={allowedHref}
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
