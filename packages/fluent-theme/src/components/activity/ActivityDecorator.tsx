import React, { ReactNode, memo } from 'react';
import styles from './ActivityDecorator.module.css';
import { useStyles, useVariantClassName } from '../../styles';
import cx from 'classnames';
import useVariants from '../../private/useVariants';
import { WebChatActivity } from 'botframework-webchat-component';
import CopilotMessageHeader from './CopilotMessageHeader';

function ActivityDecorator({ activity, children }: Readonly<{ activity: WebChatActivity; children: ReactNode }>) {
  const classNames = useStyles(styles);
  const variants = useVariants();
  const variantClassName = useVariantClassName(styles);
  const shouldRenderHeader = variants.includes('copilot') && activity?.from?.role !== 'user' && !!children;
  return (
    <div className={cx(classNames['activity-decorator'], variantClassName)}>
      {shouldRenderHeader && <CopilotMessageHeader activity={activity} />}
      {children}
    </div>
  );
}

ActivityDecorator.displayName = 'ActivityDecorator';

export default memo(ActivityDecorator);
