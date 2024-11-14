import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, useCallback } from 'react';

import useStyleSet from '../../../hooks/useStyleSet';
import useShowModal from '../../../providers/ModalDialog/useShowModal';
import LocalizedString from '../../../Utils/LocalizedString';
import ActivityButton from './ActivityButton';
import CodeContent from './CodeContent';

const CODE_ICON_URL = `data:image/svg+xml;utf8,${encodeURIComponent('<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M12.94 4.05a.75.75 0 0 0-1.38-.6l-5.5 12.5a.75.75 0 1 0 1.38.6l5.5-12.5Zm1.35 9.8a.75.75 0 0 1-.13-1.06L16.3 10l-2.14-2.8a.75.75 0 0 1 1.18-.9l2.5 3.24c.21.27.21.65 0 .92l-2.5 3.25a.75.75 0 0 1-1.05.13Zm-8.58-7.7c.33.26.39.73.13 1.06L3.7 10l2.14 2.8a.75.75 0 1 1-1.18.9l-2.5-3.24a.75.75 0 0 1 0-.92l2.5-3.25a.75.75 0 0 1 1.05-.13Z" fill="currentColor"></path></svg>')}`;

const { useLocalizer, useStyleOptions } = hooks;

type Props = Readonly<{
  className?: string | undefined;
  code: string;
  language?: string | undefined;
  isAIGenerated: boolean;
  title: string;
}>;

const ViewCodeButton = ({ className, code, language, title = '', isAIGenerated = false }: Props) => {
  const [{ codeBlockTheme }] = useStyleOptions();
  const [{ activityButton, viewCodeDialog }] = useStyleSet();
  const showModal = useShowModal();
  const localize = useLocalizer();

  const showCodeModal = useCallback(() => {
    showModal(
      () => (
        <CodeContent code={code} language={language} theme={codeBlockTheme} title={title}>
          {isAIGenerated && (
            <div className={'webchat__view-code-dialog__footer'}>
              <LocalizedString linkClassName={'webchat__view-code-dialog__link'} stringIds="ACTIVITY_CODE_CAUTION" />
            </div>
          )}
        </CodeContent>
      ),
      {
        className: classNames('webchat__view-code-dialog', viewCodeDialog),
        'aria-label': localize('ACTIVITY_CODE_ALT', title ?? '')
      }
    );
  }, [showModal, viewCodeDialog, localize, title, code, language, codeBlockTheme, isAIGenerated]);

  return (
    <ActivityButton
      className={classNames(activityButton, 'webchat__activity-button', className)}
      data-testid="view code button"
      iconURL={CODE_ICON_URL}
      onClick={showCodeModal}
      text={localize('VIEW_CODE_BUTTON_TEXT')}
    />
  );
};

export default memo(ViewCodeButton);
