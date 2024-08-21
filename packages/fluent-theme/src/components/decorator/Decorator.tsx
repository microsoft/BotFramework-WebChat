import { DecoratorComposer, type DecoratorMiddleware } from 'botframework-webchat-api/decorator';
import cx from 'classnames';
import React, { memo, type ReactNode } from 'react';

import { useStyles } from '../../styles';
import styles from './Decorator.module.css';
import Flair from './Flair';
import Loader from './Loader';

export const rootClassName = 'webchat-fluent-decorator';

const middleware: DecoratorMiddleware[] = [
  init =>
    init === 'activity border' && (next => request => (request.livestreaming === 'completing' ? Flair : next(request))),
  init =>
    init === 'activity border' &&
    (next => request => (request.livestreaming === 'informative message' ? Loader : next(request)))
];

function WebChatDecorator(props: Readonly<{ readonly children?: ReactNode | undefined }>) {
  const classNames = useStyles(styles);

  return (
    <div className={cx(rootClassName, classNames['decorator'])}>
      <DecoratorComposer middleware={middleware}>{props.children}</DecoratorComposer>
    </div>
  );
}

export default memo(WebChatDecorator);
