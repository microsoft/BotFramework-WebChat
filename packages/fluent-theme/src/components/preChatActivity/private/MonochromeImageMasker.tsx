import cx from 'classnames';
import React, { memo, useMemo } from 'react';
import { useStyles } from '../../../styles/index.js';
import styles from './MonochromeImageMasker.module.css';

type Props = Readonly<{ className?: string | undefined; src: string }>;

const MonochromeImageMasker = ({ className, src }: Props) => {
  const classNames = useStyles(styles);
  const style = useMemo(() => ({ maskImage: `url(${src})`, webkitMaskImage: `url(${src})` }), [src]);

  return (
    <div className={cx(className, classNames['pre-chat-message-activity__monochrome-image-masker'])} style={style} />
  );
};

MonochromeImageMasker.displayName = 'MonochromeImageMasker';

export default memo(MonochromeImageMasker);
