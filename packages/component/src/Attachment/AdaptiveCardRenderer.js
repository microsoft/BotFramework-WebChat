import React from 'react';

import { localize } from '../Localization/Localize';
import connectToWebChat from '../connectToWebChat';
import ErrorBox from '../ErrorBox';
import getTabIndex from '../Utils/TypeFocusSink/getTabIndex';

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
  }

  componentDidUpdate(prevProps) {
    if (prevProps.adaptiveCard !== this.props.adaptiveCard) {
      this.renderCard();
    }
  }

  handleClick({ target }) {
    // Some items, e.g. tappable text, cannot be disabled thru DOM attributes
    if (this.props.disabled) { return; }

    const tabIndex = getTabIndex(target);

    // If the user is clicking on something that is already clickable, do not allow them to click the card.
    // E.g. a hero card can be tappable, and image and buttons inside the hero card can also be tappable.
    if (typeof tabIndex !== 'number' || tabIndex < 0) {
      const { props: { onCardAction, tapAction } } = this;

      tapAction && onCardAction(tapAction);
    }
  }

  handleExecuteAction(action) {
    const { props } = this;

    // Some items, e.g. tappable image, cannot be disabled thru DOM attributes
    if (props.disabled) { return; }

    const actionTypeName = action.getJsonTypeName();

    if (actionTypeName === 'Action.OpenUrl') {
      props.onCardAction({
        type: 'openUrl',
        value: action.url
      });
    } else if (actionTypeName === 'Action.Submit') {
      if (typeof action.data !== 'undefined') {
        const { data: actionData } = action;

        if (actionData && actionData.__isBotFrameworkCardAction) {
          const { cardAction } = actionData;
          const { displayText, type, value } = cardAction;

          props.onCardAction({ displayText, type, value });
        } else {
          props.onCardAction({
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
    const { current } = this.contentRef;
    const { props: { adaptiveCard, adaptiveCardHostConfig, renderMarkdown } } = this;

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

      adaptiveCard.hostConfig = adaptiveCardHostConfig;
      adaptiveCard.onExecuteAction = this.handleExecuteAction;

      const errors = adaptiveCard.validate();

      if (errors.length) {
        return this.setState(() => ({ error: errors }));
      }

      let element;

      try {
        element = adaptiveCard.render();
      } catch (err) {
        return this.setState(() => ({ errors: err }));
      }

      if (!element) {
        return this.setState(() => ({ error: 'Adaptive Card rendered as empty element' }));
      }

      if (this.state.error) {
        this.setState(() => ({ error: null }));
      }

      if (this.props.disabled) {
        const hyperlinks = element.querySelectorAll('a');
        const inputs = element.querySelectorAll('button, input, select, textarea');

        [].forEach.call(inputs, input => {
          input.disabled = true;
        });

        [].forEach.call(hyperlinks, hyperlink => {
          hyperlink.addEventListener('click', event => {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.stopPropagation();
          });
        });
      }

      const firstChild = current.children[0];

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

    return (
      error ?
        <ErrorBox message={ localize('Adaptive Card render error', language) }>
          <pre>{ JSON.stringify(error, null, 2) }</pre>
        </ErrorBox>
      :
        <div
          className={ styleSet.adaptiveCardRenderer }
          onClick={ this.handleClick }
          ref={ this.contentRef }
        />
    );
  }
}

export default connectToWebChat(
  ({
    adaptiveCardHostConfig,
    disabled,
    language,
    onCardAction,
    renderMarkdown,
    styleSet,
    tapAction
  }) => ({
    adaptiveCardHostConfig,
    disabled,
    language,
    onCardAction,
    renderMarkdown,
    styleSet,
    tapAction
  })
)(AdaptiveCardRenderer)
