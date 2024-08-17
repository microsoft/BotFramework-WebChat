import classNames from 'classnames';
import React, { memo, useMemo, type CSSProperties } from 'react';
import { useStyleSet } from '../hooks';

type Props = Readonly<{ className?: string | undefined; src: string }>;

// TODO: This need to be deduplicated with Fluent Theme.
const MonochromeImageMasker = ({ className, src }: Props) => {
  const [{ monochromeImageMasker }] = useStyleSet();
  const style = useMemo(
    () => ({ '--webchat__monochrome-image-masker__mask-image': `url(${src})` }) as CSSProperties,
    [src]
  );

  return (
    <div className={classNames(monochromeImageMasker, 'webchat__monochrome-image-masker', className)} style={style} />
  );
};

MonochromeImageMasker.displayName = 'MonochromeImageMasker';

export default memo(MonochromeImageMasker);
