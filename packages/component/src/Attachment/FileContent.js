import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import DownloadIcon from './Assets/DownloadIcon';
import ScreenReaderText from '../ScreenReaderText';
import useByteFormatter from '../hooks/useByteFormatter';
import useDirection from '../hooks/useDirection';
import useLocalizer from '../hooks/useLocalizer';
import useStyleSet from '../hooks/useStyleSet';

const ROOT_CSS = css({
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
});

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

const FileContent = ({ className, href, fileName, size }) => {
  const [{ fileContent: fileContentStyleSet }] = useStyleSet();
  const localize = useLocalizer();
  const localizeBytes = useByteFormatter();

  const localizedSize = typeof size === 'number' && localizeBytes(size);

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
      aria-hidden={true}
      className={classNames('webchat__fileContent', ROOT_CSS + '', fileContentStyleSet + '', (className || '') + '')}
    >
      <ScreenReaderText text={alt} />
      {href ? (
        <a
          aria-hidden={true}
          className="webchat__fileContent__buttonLink"
          download={fileName}
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {/* Although nested, Chrome v75 does not respect the above aria-hidden and makes the below aria-hidden in FileContentBadge necessary */}
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
