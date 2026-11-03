import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import React, { memo, useCallback } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useShowModal from '../../../providers/ModalDialog/useShowModal';
import LocalizedString from '../../../Utils/LocalizedString';
import ActivityButton from './ActivityButton';
import CodeContent from './CodeContent';

import styles from './ViewCodeDialog.module.css';

const { useLocalizer } = hooks;

// Class names of this module for the modal dialog's parts, which ViewCodeDialog.module.css styles.
const modalDialogTheme = Object.freeze({
  'modal-dialog': styles['modal-dialog'],
  'modal-dialog__body': styles['modal-dialog__body'],
  'modal-dialog__box': styles['modal-dialog__box'],
  'modal-dialog__close-button-layout': styles['modal-dialog__close-button-layout']
});

const activityViewCodeButtonPropsSchema = pipe(
  object({
    className: optional(string()),
    code: string(),
    language: optional(string()),
    isAIGenerated: boolean(),
    title: optional(string())
  }),
  readonly()
);

type ActivityViewCodeButtonProps = InferInput<typeof activityViewCodeButtonPropsSchema>;

const ActivityViewCodeButton = (props: ActivityViewCodeButtonProps) => {
  const { className, code, language, title, isAIGenerated } = validateProps(activityViewCodeButtonPropsSchema, props);
  const classNames = useStyles(styles);

  const showModal = useShowModal();
  const localize = useLocalizer();

  const showCodeModal = useCallback(() => {
    showModal(
      () => (
        <CodeContent code={code} language={language} title={title}>
          {isAIGenerated && (
            <div className={classNames['view-code-dialog__footer']}>
              <LocalizedString linkClassName={'view-code-dialog__link'} stringIds="ACTIVITY_CODE_CAUTION" />
            </div>
          )}
        </CodeContent>
      ),
      {
        'aria-label': localize('ACTIVITY_CODE_ALT', title ?? ''),
        className: classNames['view-code-dialog'],
        cssModuleTheme: modalDialogTheme
      }
    );
  }, [code, isAIGenerated, language, localize, showModal, title, classNames]);

  return (
    <ActivityButton
      className={className}
      data-testid="view code button"
      icon="view-code"
      onClick={showCodeModal}
      text={localize('VIEW_CODE_BUTTON_TEXT')}
    />
  );
};

export default memo(ActivityViewCodeButton);
export { activityViewCodeButtonPropsSchema, type ActivityViewCodeButtonProps };
