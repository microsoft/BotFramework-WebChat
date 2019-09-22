/* eslint no-magic-numbers: ["error", { "ignore": [0, 2] }] */

import { HostConfig } from 'adaptivecards';
import PropTypes from 'prop-types';
import React from 'react';

import { Components, connectToWebChat, getTabIndex, localize } from 'botframework-webchat-component';

const { ErrorBox } = Components;

function isPlainObject(obj) {
  return Object.getPrototypeOf(obj) === Object.prototype;
}

class AdaptiveCardRenderer extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.handleExecuteAction = this.handleExecuteAction.bind(this);

    this.contentRef = React.createRef();

    this.state = {
      error: null
    };
  }

  componentDidMount() {
    this.renderCard();
    this.refreshDisabled();
  }

  componentDidUpdate({ adaptiveCard: prevAdaptiveCard, disabled: prevDisabled }) {
    const { adaptiveCard, disabled } = this.props;

    prevAdaptiveCard !== adaptiveCard && this.renderCard();
    !prevDisabled !== !disabled && this.refreshDisabled();
  }

  refreshDisabled() {
    const { disabled } = this.props;
    const { current } = this.contentRef;

    if (current) {
      const {
        children: [element]
      } = current;

      [].forEach.call(element.querySelectorAll('button, input, select, textarea'), input => {
        input.disabled = disabled;
      });
    }
  }

  handleClick({ target }) {
    const { disabled, onCardAction, tapAction } = this.props;

    // Some items, e.g. tappable text, cannot be disabled thru DOM attributes
    if (!disabled) {
      const tabIndex = getTabIndex(target);

      // If the user is clicking on something that is already clickable, do not allow them to click the card.
      // E.g. a hero card can be tappable, and image and buttons inside the hero card can also be tappable.
      if (typeof tabIndex !== 'number' || tabIndex < 0) {
        tapAction && onCardAction(tapAction);
      }
    }
  }

  handleExecuteAction(action) {
    const { disabled, onCardAction } = this.props;

    // Some items, e.g. tappable image, cannot be disabled thru DOM attributes
    if (disabled) {
      return;
    }

    const actionTypeName = action.getJsonTypeName();

    if (actionTypeName === 'Action.OpenUrl') {
      onCardAction({
        type: 'openUrl',
        value: action.url
      });
    } else if (actionTypeName === 'Action.Submit') {
      if (typeof action.data !== 'undefined') {
        const { data: actionData } = action;

        if (actionData && actionData.__isBotFrameworkCardAction) {
          const { cardAction } = actionData;
          const { displayText, type, value } = cardAction;

          onCardAction({ displayText, type, value });
        } else {
          onCardAction({
            type: typeof action.data === 'string' ? 'imBack' : 'postBack',
            value: action.data
          });
        }
      }
    } else {
      console.error(`Web Chat: received unknown action from Adaptive Cards`);
      console.error(action);
    }
  }

  renderCard() {
    const {
      contentRef: { current },
      props: { adaptiveCard, adaptiveCardHostConfig, renderMarkdown },
      state: { error }
    } = this;

    if (current && adaptiveCard) {
      // Currently, the only way to set the Markdown engine is to set it thru static member of AdaptiveCard class

      // TODO: [P3] Checks if we could make the "renderMarkdown" per card
      //       This could be limitations from Adaptive Cards package
      //       Because there could be timing difference between .parse and .render, we could be using wrong Markdown engine

      adaptiveCard.constructor.onProcessMarkdown = (text, result) => {
        if (renderMarkdown) {
          result.outputHtml = renderMarkdown(text);
          result.didProcess = true;
        }
      };

      adaptiveCard.onExecuteAction = this.handleExecuteAction;

      if (adaptiveCardHostConfig) {
        adaptiveCard.hostConfig = isPlainObject(adaptiveCardHostConfig)
          ? new HostConfig(adaptiveCardHostConfig)
          : adaptiveCardHostConfig;
      }

      const { failures } = adaptiveCard.validateProperties();

      if (failures.length) {
        // TODO: [P3] Since this can be called from `componentDidUpdate` and potentially error, we should fix a better way to propagate the error.
        const errors = failures.reduce((items, { errors }) => [...items, ...errors], []);
        return this.setState(() => ({ error: errors }));
      }

      let element;

      try {
        element = adaptiveCard.render();
      } catch (error) {
        return this.setState(() => ({ error }));
      }

      if (!element) {
        return this.setState(() => ({ error: 'Adaptive Card rendered as empty element' }));
      }

      error && this.setState(() => ({ error: null }));

      [].forEach.call(element.querySelectorAll('a'), hyperlink => {
        hyperlink.addEventListener('click', event => {
          const { disabled } = this.props;

          if (disabled) {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
          }
        });
      });

      const [firstChild] = current.children;

      if (firstChild) {
        current.replaceChild(element, firstChild);
      } else {
        current.appendChild(element);
      }
    }
  }

  render() {
    const {
      props: { language, styleSet },
      state: { error }
    } = this;

    return error ? (
      <ErrorBox message={localize('Adaptive Card render error', language)}>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </ErrorBox>
    ) : (
      <div className={styleSet.adaptiveCardRenderer} onClick={this.handleClick} ref={this.contentRef} />
    );
  }
}

AdaptiveCardRenderer.propTypes = {
  adaptiveCard: PropTypes.any.isRequired,
  adaptiveCardHostConfig: PropTypes.any.isRequired,
  disabled: PropTypes.bool,
  language: PropTypes.string.isRequired,
  onCardAction: PropTypes.func.isRequired,
  renderMarkdown: PropTypes.func.isRequired,
  styleSet: PropTypes.shape({
    adaptiveCardRenderer: PropTypes.any.isRequired
  }).isRequired,
  tapAction: PropTypes.shape({
    type: PropTypes.string.isRequired,
    value: PropTypes.string
  })
};

AdaptiveCardRenderer.defaultProps = {
  disabled: false,
  tapAction: undefined
};

export default connectToWebChat(({ disabled, language, onCardAction, renderMarkdown, styleSet, tapAction }) => ({
  disabled,
  language,
  onCardAction,
  renderMarkdown,
  styleSet,
  tapAction
}))(AdaptiveCardRenderer);
