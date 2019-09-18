import { StateContext as ScrollToBottomStateContext } from 'react-scroll-to-bottom';

import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Localize from '../Localization/Localize';
import useScrollToEnd from '../hooks/useScrollToEnd';
import useStyleSet from '../hooks/useStyleSet';

const ScrollToEndButton = ({ className }) => {
  const [{ scrollToEndButton: scrollToEndButtonStyleSet }] = useStyleSet();

  const scrollToEnd = useScrollToEnd();

  return (
    <ScrollToBottomStateContext.Consumer>
      {({ sticky }) =>
        !sticky && (
          <button
            className={classNames(scrollToEndButtonStyleSet + '', className + '')}
            onClick={scrollToEnd}
            type="button"
          >
            <Localize text="New messages" />
          </button>
        )
      }
    </ScrollToBottomStateContext.Consumer>
  );
};

ScrollToEndButton.defaultProps = {
  className: ''
};

ScrollToEndButton.propTypes = {
  className: PropTypes.string
};

export default ScrollToEndButton;
