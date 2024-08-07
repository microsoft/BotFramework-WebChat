import cx from 'classnames';
import React, { memo, useMemo } from 'react';
import { useStyles } from '../../../styles/index.js';
import styles from './RecolorMonochromeImage.module.css';

type Props = Readonly<{ className?: string | undefined; src: string }>;

const RecolorMonochromeImage = ({ className, src }: Props) => {
  const classNames = useStyles(styles);
  const style = useMemo(() => ({ maskImage: `url(${src})` }), [src]);

  return (
    <div className={cx(className, classNames['pre-chat-message-activity__recolor-monochrome-image'])} style={style} />
  );
};

RecolorMonochromeImage.displayName = 'RecolorMonochromeImage';

export default memo(RecolorMonochromeImage);
