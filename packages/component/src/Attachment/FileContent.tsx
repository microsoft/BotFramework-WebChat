import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { FC } from 'react';

import DownloadIcon from './Assets/DownloadIcon';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

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
  } catch (err) {
    return false;
  }
}

const FileContentBadge = ({ downloadIcon, fileName, size }) => {
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
        <DownloadIcon
          className={classNames(
            'webchat__fileContent__downloadIcon',
            direction === 'rtl' && 'webchat__fileContent__downloadIcon--rtl'
          )}
          size={1.5}
        />
      )}
    </React.Fragment>
  );
};

FileContentBadge.defaultProps = {
  downloadIcon: false,
  size: undefined
};

FileContentBadge.propTypes = {
  downloadIcon: PropTypes.bool,
  fileName: PropTypes.string.isRequired,
  size: PropTypes.number
};

type FileContentProps = {
  className?: string;
  fileName: string;
  href?: string;
  size?: number;
};

const FileContent: FC<FileContentProps> = ({ className, href, fileName, size }) => {
  const [{ fileContent: fileContentStyleSet }] = useStyleSet();
  const localize = useLocalizer();
  const localizeBytes = useByteFormatter();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  const localizedSize = typeof size === 'number' && localizeBytes(size);

  href = href && isAllowedProtocol(href) ? href : undefined;

  const alt = localize(
    href
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
    <div
      className={classNames('webchat__fileContent', rootClassName, fileContentStyleSet + '', (className || '') + '')}
    >
      {href ? (
        <a
          aria-label={alt}
          className="webchat__fileContent__buttonLink"
          download={fileName}
          href={href}
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
};

FileContent.defaultProps = {
  className: '',
  href: undefined,
  size: undefined
};

FileContent.propTypes = {
  className: PropTypes.string,
  fileName: PropTypes.string.isRequired,
  href: PropTypes.string,
  size: PropTypes.number
};

export default FileContent;
