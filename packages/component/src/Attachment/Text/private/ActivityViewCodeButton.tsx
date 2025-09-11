import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { memo, useCallback } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleSet from '../../../hooks/useStyleSet';
import useShowModal from '../../../providers/ModalDialog/useShowModal';
import LocalizedString from '../../../Utils/LocalizedString';
import ActivityButton from './ActivityButton';
import CodeContent from './CodeContent';

import styles from './ViewCodeDialog.module.css';

const { useLocalizer } = hooks;

const activityViewCodeButtonPropsSchema = pipe(
  object({
    className: optional(string()),
    code: string(),
    language: optional(string()),
    isAIGenerated: boolean(),
    title: string()
  }),
  readonly()
);

type ActivityViewCodeButtonProps = InferInput<typeof activityViewCodeButtonPropsSchema>;

const ActivityViewCodeButton = (props: ActivityViewCodeButtonProps) => {
  const { className, code, language, title, isAIGenerated } = validateProps(activityViewCodeButtonPropsSchema, props);
  const classNames = useStyles(styles);

  const [{ activityButton }] = useStyleSet();
  const showModal = useShowModal();
  const localize = useLocalizer();

  const showCodeModal = useCallback(() => {
    showModal(
      () => (
        <CodeContent code={code} language={language} title={title}>
          {isAIGenerated && (
            <div className={classNames['view-code-dialog__footer']}>
              <LocalizedString linkClassName={'webchat__view-code-dialog__link'} stringIds="ACTIVITY_CODE_CAUTION" />
            </div>
          )}
        </CodeContent>
      ),
      {
        className: cx('webchat__view-code-dialog', classNames['view-code-dialog']),
        'aria-label': localize('ACTIVITY_CODE_ALT', title ?? '')
      }
    );
  }, [code, isAIGenerated, language, localize, showModal, title, classNames]);

  return (
    <ActivityButton
      className={cx(activityButton, 'webchat__activity-button', className)}
      data-testid="view code button"
      icon="view-code"
      onClick={showCodeModal}
      text={localize('VIEW_CODE_BUTTON_TEXT')}
    />
  );
};

export default memo(ActivityViewCodeButton);
export { activityViewCodeButtonPropsSchema, type ActivityViewCodeButtonProps };
