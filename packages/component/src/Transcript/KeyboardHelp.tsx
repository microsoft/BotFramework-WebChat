import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import type { FC } from 'react';

import useFocus from '../hooks/useFocus';
import useStyleSet from '../hooks/useStyleSet';
import useUniqueId from '../hooks/internal/useUniqueId';

const { useLocalizer } = hooks;

type NotesBodyProps = {
  header: string;
  text: string;
};

const Notes: FC<NotesBodyProps> = ({ header, text }) => (
  <section className="webchat__keyboard-help__notes">
    <h4 className="webchat__keyboard-help__notes-header">{header}</h4>
    {text.split('\n').map((line, index) => (
      // We are splitting lines into paragraphs, index as key is legitimate here.
      // eslint-disable-next-line react/no-array-index-key
      <p className="webchat__keyboard-help__notes-text" key={index}>
        {line}
      </p>
    ))}
  </section>
);

Notes.propTypes = {
  header: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
};

const KeyboardHelp: FC<{}> = () => {
  const [{ keyboardHelp: keyboardHelpStyleSet }] = useStyleSet();
  const [shown, setShown] = useState(false);
  const focus = useFocus();
  const headerLabelId = useUniqueId('webchat__keyboard-help__header');
  const localize = useLocalizer();

  const chatHistoryAccessItemsInMessageBody = localize('KEYBOARD_HELP_CHAT_HISTORY_ACCESS_ITEMS_IN_MESSAGE_BODY');
  const chatHistoryAccessItemsInMessageHeader = localize('KEYBOARD_HELP_CHAT_HISTORY_ACCESS_ITEMS_IN_MESSAGE_HEADER');
  const chatHistoryHeader = localize('KEYBOARD_HELP_CHAT_HISTORY_HEADER');
  const chatHistoryLeaveMessageBody = localize('KEYBOARD_HELP_CHAT_HISTORY_LEAVE_MESSAGE_BODY');
  const chatHistoryLeaveMessageHeader = localize('KEYBOARD_HELP_CHAT_HISTORY_LEAVE_MESSAGE_HEADER');
  const chatHistoryMoveBetweenItemsBody = localize('KEYBOARD_HELP_CHAT_HISTORY_MOVE_BETWEEN_ITEMS_BODY');
  const chatHistoryMoveBetweenItemsHeader = localize('KEYBOARD_HELP_CHAT_HISTORY_MOVE_BETWEEN_ITEMS_HEADER');
  const chatHistoryMoveBetweenMessagesBody = localize('KEYBOARD_HELP_CHAT_HISTORY_MOVE_BETWEEN_MESSAGES_BODY');
  const chatHistoryMoveBetweenMessagesHeader = localize('KEYBOARD_HELP_CHAT_HISTORY_MOVE_BETWEEN_MESSAGES_HEADER');
  const chatWindowBodyDoActionBody = localize('KEYBOARD_HELP_CHAT_WINDOW_BODY_DO_ACTION_BODY');
  const chatWindowBodyDoActionHeader = localize('KEYBOARD_HELP_CHAT_WINDOW_BODY_DO_ACTION_HEADER');
  const chatWindowBodyMoveBetweenItemsBody = localize('KEYBOARD_HELP_CHAT_WINDOW_BODY_MOVE_BETWEEN_ITEMS_BODY');
  const chatWindowBodyMoveBetweenItemsHeader = localize('KEYBOARD_HELP_CHAT_WINDOW_BODY_MOVE_BETWEEN_ITEMS_HEADER');
  const chatWindowHeader = localize('KEYBOARD_HELP_CHAT_WINDOW_HEADER');
  const closeButtonAlt = localize('KEYBOARD_HELP_CLOSE_BUTTON_ALT');
  const header = localize('KEYBOARD_HELP_HEADER');

  const handleBlur = useCallback(
    // We will keep the help screen shown if the blur is caused by switch app.
    // When switch app, `document.activeElement` will remains.
    event => document.activeElement !== event.target && setShown(false),
    [setShown]
  );

  const handleCloseButtonClick = useCallback(() => focus('main'), [focus]);
  const handleCloseButtonFocus = useCallback(() => setShown(true), [setShown]);

  const handleCloseButtonKeyDown = useCallback(
    event => {
      const { key } = event;

      if (key === 'Enter' || key === 'Escape' || key === ' ') {
        event.preventDefault();
        event.stopPropagation();

        focus('main');
      }
    },
    [focus]
  );

  return (
    <div
      aria-labelledby={headerLabelId}
      className={classNames('webchat__keyboard-help', keyboardHelpStyleSet + '', {
        // Instead of using "hidden" attribute, we are using CSS to hide the dialog.
        // - When using "hidden", the close button will not be tabbable because it is pseudo removed from the DOM
        // - When using CSS, the close button will still be tabbable
        // We prefer CSS because the focus need to land on close button, but we don't want to move the focus using JavaScript.
        'webchat__keyboard-help--shown': shown
      })}
      onBlur={handleBlur}
      role="dialog"
    >
      {/* The __border layer is for showing the shadowy border.
          Without this layer, the border will be hidden by overflow: hidden. */}
      <div className="webchat__keyboard-help__border">
        <div className="webchat__keyboard-help__box">
          {/* The __scrollable layer is for hiding scrollbar at corners.
              Without this layer, the scrollbar will show and overflow the border-radius.
              This impact will be more visible if we temporarily set border-radius: 20px. */}
          <div className="webchat__keyboard-help__scrollable">
            <button
              aria-label={closeButtonAlt}
              className="webchat__keyboard-help__close-button"
              onClick={handleCloseButtonClick}
              onFocus={handleCloseButtonFocus}
              onKeyDown={handleCloseButtonKeyDown}
              type="button"
            >
              <div className="webchat__keyboard-help__close-button-border">
                <svg
                  className="webchat__keyboard-help__close-button-image"
                  // "focusable" attribute is only available in IE11 and "tabIndex={-1}" does not work.
                  focusable={false}
                  role="presentation"
                  viewBox="0 0 2048 2048"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2048 136l-888 888 888 888-136 136-888-888-888 888L0 1912l888-888L0 136 136 0l888 888L1912 0l136 136z" />
                </svg>
              </div>
            </button>
            {/* "id" attribute is required when using "aria-labelledby". */}
            {/* eslint-disable-next-line react/forbid-dom-props */}
            <h2 className="webchat__keyboard-help__header" id={headerLabelId}>
              {header}
            </h2>
            <article className="webchat__keyboard-help__section">
              <header>
                <h3 className="webchat__keyboard-help__sub-header">{chatWindowHeader}</h3>
              </header>
              <div className="webchat__keyboard-help__two-panes">
                <svg
                  className="webchat__keyboard-help__image webchat__keyboard-help__image--light"
                  fill="none"
                  // "focusable" attribute is only available in IE11 and "tabIndex={-1}" does not work.
                  focusable={false}
                  height="200"
                  role="presentation"
                  viewBox="0 0 121 200"
                  width="121"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect height="199" stroke="#C8C6C4" width="109" x="0.5" y="0.5" />
                  <rect height="156" stroke="#323130" width="102" x="3.5" y="4.5" />
                  <rect height="42" stroke="#C8C6C4" width="93" x="7.5" y="8.5" />
                  <rect height="99" stroke="#C8C6C4" width="93" x="7.5" y="55.5" />
                  <rect height="13" stroke="#323130" width="102" x="3.5" y="182.5" />
                  <rect height="13" stroke="#323130" width="32" x="3.5" y="165.5" />
                  <rect height="13" stroke="#323130" width="32" x="38.5" y="165.5" />
                  <rect height="13" stroke="#323130" width="32" x="73.5" y="165.5" />
                  <path
                    clipRule="evenodd"
                    d="M116.328 5.64645C116.524 5.45118 116.84 5.45118 117.036 5.64645L120.218 8.82843C120.413 9.02369 120.413 9.34027 120.218 9.53553C120.022 9.7308 119.706 9.7308 119.51 9.53553L117.182 7.20711V192.793L119.51 190.464C119.706 190.269 120.022 190.269 120.218 190.464C120.413 190.66 120.413 190.976 120.218 191.172L117.036 194.354C116.84 194.549 116.524 194.549 116.328 194.354L113.146 191.172C112.951 190.976 112.951 190.66 113.146 190.464C113.342 190.269 113.658 190.269 113.854 190.464L116.182 192.793V7.20711L113.854 9.53553C113.658 9.7308 113.342 9.7308 113.146 9.53553C112.951 9.34027 112.951 9.02369 113.146 8.82843L116.328 5.64645Z"
                    fill="#323130"
                    fillRule="evenodd"
                  />
                </svg>
                <svg
                  className="webchat__keyboard-help__image webchat__keyboard-help__image--dark"
                  fill="none"
                  // "focusable" attribute is only available in IE11 and "tabIndex={-1}" does not work.
                  focusable={false}
                  height="200"
                  role="presentation"
                  viewBox="0 0 121 200"
                  width="121"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect height="199" stroke="#484644" width="109" x="0.5" y="0.5" />
                  <rect height="156" stroke="#F3F2F1" width="102" x="3.5" y="4.5" />
                  <rect height="42" stroke="#484644" width="93" x="7.5" y="8.5" />
                  <rect height="99" stroke="#484644" width="93" x="7.5" y="55.5" />
                  <rect height="13" stroke="#F3F2F1" width="102" x="3.5" y="182.5" />
                  <rect height="13" stroke="#F3F2F1" width="32" x="3.5" y="165.5" />
                  <rect height="13" stroke="#F3F2F1" width="32" x="38.5" y="165.5" />
                  <rect height="13" stroke="#F3F2F1" width="32" x="73.5" y="165.5" />
                  <path
                    clipRule="evenodd"
                    d="M116.328 5.64645C116.524 5.45118 116.84 5.45118 117.036 5.64645L120.218 8.82843C120.413 9.02369 120.413 9.34027 120.218 9.53553C120.022 9.7308 119.706 9.7308 119.51 9.53553L117.182 7.20711V192.793L119.51 190.464C119.706 190.269 120.022 190.269 120.218 190.464C120.413 190.66 120.413 190.976 120.218 191.172L117.036 194.354C116.84 194.549 116.524 194.549 116.328 194.354L113.146 191.172C112.951 190.976 112.951 190.66 113.146 190.464C113.342 190.269 113.658 190.269 113.854 190.464L116.182 192.793V7.20711L113.854 9.53553C113.658 9.7308 113.342 9.7308 113.146 9.53553C112.951 9.34027 112.951 9.02369 113.146 8.82843L116.328 5.64645Z"
                    fill="#F3F2F1"
                    fillRule="evenodd"
                  />
                </svg>
                <svg
                  className="webchat__keyboard-help__image webchat__keyboard-help__image--high-contrast"
                  fill="none"
                  // "focusable" attribute is only available in IE11 and "tabIndex={-1}" does not work.
                  focusable={false}
                  height="200"
                  role="presentation"
                  viewBox="0 0 121 200"
                  width="121"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect height="199" stroke="white" width="109" x="0.5" y="0.5" />
                  <rect height="156" stroke="white" width="102" x="3.5" y="4.5" />
                  <rect height="42" stroke="white" width="93" x="7.5" y="8.5" />
                  <rect height="99" stroke="white" width="93" x="7.5" y="55.5" />
                  <rect height="13" stroke="white" width="102" x="3.5" y="182.5" />
                  <rect height="13" stroke="white" width="32" x="3.5" y="165.5" />
                  <rect height="13" stroke="white" width="32" x="38.5" y="165.5" />
                  <rect height="13" stroke="white" width="32" x="73.5" y="165.5" />
                  <path
                    clipRule="evenodd"
                    d="M116.328 5.64645C116.524 5.45118 116.84 5.45118 117.036 5.64645L120.218 8.82843C120.413 9.02369 120.413 9.34027 120.218 9.53553C120.022 9.7308 119.706 9.7308 119.51 9.53553L117.182 7.20711V192.793L119.51 190.464C119.706 190.269 120.022 190.269 120.218 190.464C120.413 190.66 120.413 190.976 120.218 191.172L117.036 194.354C116.84 194.549 116.524 194.549 116.328 194.354L113.146 191.172C112.951 190.976 112.951 190.66 113.146 190.464C113.342 190.269 113.658 190.269 113.854 190.464L116.182 192.793V7.20711L113.854 9.53553C113.658 9.7308 113.342 9.7308 113.146 9.53553C112.951 9.34027 112.951 9.02369 113.146 8.82843L116.328 5.64645Z"
                    fill="white"
                    fillRule="evenodd"
                  />
                </svg>
                <div className="webchat__keyboard-help__notes-pane">
                  <Notes header={chatWindowBodyMoveBetweenItemsHeader} text={chatWindowBodyMoveBetweenItemsBody} />
                  <Notes header={chatWindowBodyDoActionHeader} text={chatWindowBodyDoActionBody} />
                </div>
              </div>
            </article>
            <article className="webchat__keyboard-help__section">
              <header>
                <h3 className="webchat__keyboard-help__header">{chatHistoryHeader}</h3>
              </header>
              <div className="webchat__keyboard-help__two-panes">
                <svg
                  className="webchat__keyboard-help__image webchat__keyboard-help__image--light"
                  fill="none"
                  // "focusable" attribute is only available in IE11 and "tabIndex={-1}" does not work.
                  focusable={false}
                  height="200"
                  role="presentation"
                  viewBox="0 0 121 200"
                  width="121"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect height="199" stroke="#C8C6C4" width="109" x="0.5" y="0.5" />
                  <rect height="156" stroke="#323130" width="102" x="3.5" y="4.5" />
                  <rect height="42" stroke="#323130" strokeDasharray="2 2" width="93" x="7.5" y="8.5" />
                  <rect height="99" stroke="#323130" strokeDasharray="2 2" width="93" x="7.5" y="55.5" />
                  <rect height="13" stroke="#C8C6C4" width="102" x="3.5" y="182.5" />
                  <rect height="13" stroke="#C8C6C4" width="32" x="3.5" y="165.5" />
                  <rect height="13" stroke="#C8C6C4" width="32" x="38.5" y="165.5" />
                  <rect height="13" stroke="#C8C6C4" width="32" x="73.5" y="165.5" />
                  <path
                    clipRule="evenodd"
                    d="M116.328 7.64645C116.524 7.45118 116.84 7.45118 117.036 7.64645L120.218 10.8284C120.413 11.0237 120.413 11.3403 120.218 11.5355C120.022 11.7308 119.706 11.7308 119.51 11.5355L117.182 9.20711V156.793L119.51 154.464C119.706 154.269 120.022 154.269 120.218 154.464C120.413 154.66 120.413 154.976 120.218 155.172L117.036 158.354C116.84 158.549 116.524 158.549 116.328 158.354L113.146 155.172C112.951 154.976 112.951 154.66 113.146 154.464C113.342 154.269 113.658 154.269 113.854 154.464L116.182 156.793V9.20711L113.854 11.5355C113.658 11.7308 113.342 11.7308 113.146 11.5355C112.951 11.3403 112.951 11.0237 113.146 10.8284L116.328 7.64645Z"
                    fill="#323130"
                    fillRule="evenodd"
                  />
                </svg>
                <svg
                  className="webchat__keyboard-help__image webchat__keyboard-help__image--dark"
                  fill="none"
                  // "focusable" attribute is only available in IE11 and "tabIndex={-1}" does not work.
                  focusable={false}
                  height="200"
                  role="presentation"
                  viewBox="0 0 121 200"
                  width="121"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect height="199" stroke="#484644" width="109" x="0.5" y="0.5" />
                  <rect height="156" stroke="#F3F2F1" width="102" x="3.5" y="4.5" />
                  <rect height="42" stroke="#F3F2F1" strokeDasharray="2 2" width="93" x="7.5" y="8.5" />
                  <rect height="99" stroke="#F3F2F1" strokeDasharray="2 2" width="93" x="7.5" y="55.5" />
                  <rect height="13" stroke="#484644" width="102" x="3.5" y="182.5" />
                  <rect height="13" stroke="#484644" width="32" x="3.5" y="165.5" />
                  <rect height="13" stroke="#484644" width="32" x="38.5" y="165.5" />
                  <rect height="13" stroke="#484644" width="32" x="73.5" y="165.5" />
                  <path
                    clipRule="evenodd"
                    d="M116.328 7.64645C116.524 7.45118 116.84 7.45118 117.036 7.64645L120.218 10.8284C120.413 11.0237 120.413 11.3403 120.218 11.5355C120.022 11.7308 119.706 11.7308 119.51 11.5355L117.182 9.20711V156.793L119.51 154.464C119.706 154.269 120.022 154.269 120.218 154.464C120.413 154.66 120.413 154.976 120.218 155.172L117.036 158.354C116.84 158.549 116.524 158.549 116.328 158.354L113.146 155.172C112.951 154.976 112.951 154.66 113.146 154.464C113.342 154.269 113.658 154.269 113.854 154.464L116.182 156.793V9.20711L113.854 11.5355C113.658 11.7308 113.342 11.7308 113.146 11.5355C112.951 11.3403 112.951 11.0237 113.146 10.8284L116.328 7.64645Z"
                    fill="#F3F2F1"
                    fillRule="evenodd"
                  />
                </svg>
                <svg
                  className="webchat__keyboard-help__image webchat__keyboard-help__image--high-contrast"
                  fill="none"
                  // "focusable" attribute is only available in IE11 and "tabIndex={-1}" does not work.
                  focusable={false}
                  height="200"
                  role="presentation"
                  viewBox="0 0 121 200"
                  width="121"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect height="199" stroke="white" width="109" x="0.5" y="0.5" />
                  <rect height="156" stroke="white" width="102" x="3.5" y="4.5" />
                  <rect height="42" stroke="white" strokeDasharray="2 2" width="93" x="7.5" y="8.5" />
                  <rect height="99" stroke="white" strokeDasharray="2 2" width="93" x="7.5" y="55.5" />
                  <rect height="13" stroke="white" width="102" x="3.5" y="182.5" />
                  <rect height="13" stroke="white" width="32" x="3.5" y="165.5" />
                  <rect height="13" stroke="white" width="32" x="38.5" y="165.5" />
                  <rect height="13" stroke="white" width="32" x="73.5" y="165.5" />
                  <path
                    clipRule="evenodd"
                    d="M116.328 7.64645C116.524 7.45118 116.84 7.45118 117.036 7.64645L120.218 10.8284C120.413 11.0237 120.413 11.3403 120.218 11.5355C120.022 11.7308 119.706 11.7308 119.51 11.5355L117.182 9.20711V156.793L119.51 154.464C119.706 154.269 120.022 154.269 120.218 154.464C120.413 154.66 120.413 154.976 120.218 155.172L117.036 158.354C116.84 158.549 116.524 158.549 116.328 158.354L113.146 155.172C112.951 154.976 112.951 154.66 113.146 154.464C113.342 154.269 113.658 154.269 113.854 154.464L116.182 156.793V9.20711L113.854 11.5355C113.658 11.7308 113.342 11.7308 113.146 11.5355C112.951 11.3403 112.951 11.0237 113.146 10.8284L116.328 7.64645Z"
                    fill="white"
                    fillRule="evenodd"
                  />
                </svg>
                <div className="webchat__keyboard-help__notes-pane">
                  <Notes header={chatHistoryMoveBetweenMessagesHeader} text={chatHistoryMoveBetweenMessagesBody} />
                  <Notes header={chatHistoryAccessItemsInMessageHeader} text={chatHistoryAccessItemsInMessageBody} />
                  <Notes header={chatHistoryMoveBetweenItemsHeader} text={chatHistoryMoveBetweenItemsBody} />
                  <Notes header={chatHistoryLeaveMessageHeader} text={chatHistoryLeaveMessageBody} />
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardHelp;
