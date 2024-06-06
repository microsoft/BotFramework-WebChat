import React, { memo, type ReactNode } from 'react';
import cx from 'classnames';
import styles from './Decorator.module.css';
import { useStyles } from '../../styles';
import { DecoratorComposer, type DecoratorMiddleware } from 'botframework-webchat-api/decorator';
import Flair from './Flair';
import Loader from './Loader';

export const rootClassName = 'webchat-fluent-decorator';

const middleware: DecoratorMiddleware[] = [
  init => (init === 'flair' ? () => () => Flair : false),
  init => (init === 'loader' ? () => () => Loader : false)
];

function WebchatDecorator(props: Readonly<{ readonly children: ReactNode | undefined }>) {
  const classNames = useStyles(styles);
  return (
    <div className={cx(rootClassName, classNames['decorator'])}>
      <DecoratorComposer middleware={middleware}>{props.children}</DecoratorComposer>
    </div>
  );
}

export default memo(WebchatDecorator);
