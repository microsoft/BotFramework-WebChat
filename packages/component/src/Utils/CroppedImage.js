import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

const ROOT_STYLE = {
  overflow: 'hidden',
  position: 'relative',

  '& > img': {
    height: 'auto',
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%'
  }
};

const CroppedImage = ({ alt, className, height, src, width }) => {
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';
  const sizeStyle = useMemo(() => ({ height, width }), [height, width]);

  return (
    <div className={classNames(rootClassName, (className || '') + '')} style={sizeStyle}>
      <img alt={alt} src={src} />
    </div>
  );
};

CroppedImage.defaultProps = {
  alt: '',
  className: ''
};

CroppedImage.propTypes = {
  alt: PropTypes.string,
  className: PropTypes.string,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  src: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
};

export default CroppedImage;
