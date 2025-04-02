/* eslint complexity: ["error", 50] */

import { hooks } from 'botframework-webchat-component';
import classNames from 'classnames';
import React, { memo } from 'react';
import { useStyles } from '../../../styles';
import { type WebChatActivity } from 'botframework-webchat-core';
import type { ReactNode } from 'react';
import styles from './StackedLayout.module.css';
import ActivityDecorator from '../ActivityDecorator';

const { useStyleSet } = hooks;

type StackedLayoutProps = Readonly<{
  activity: WebChatActivity;
  children?: ReactNode | undefined;
}>;

const StackedLayout = ({ activity, children }: StackedLayoutProps) => {
  const classes = useStyles(styles);
  const [{ stackedLayout: stackedLayoutStyleSet }] = useStyleSet();
  return (
    <div className={classNames('webchat__stacked-layout', classes['webchat__stacked-layout'], stackedLayoutStyleSet)}>
      <div className="webchat__stacked-layout__main">
        <div className="webchat__stacked-layout__avatar-gutter" />
        <div className="webchat__stacked-layout__content">
          <div
            aria-roledescription="message"
            className="webchat__stacked-layout__message-row"
            // Disable "Prop `id` is forbidden on DOM Nodes" rule because we are using the ID prop for accessibility.
            /* eslint-disable-next-line react/forbid-dom-props */
            role="group"
          >
            <div className={classes['webchat__card']}>
              <ActivityDecorator activity={activity}>{children}</ActivityDecorator>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(StackedLayout);
