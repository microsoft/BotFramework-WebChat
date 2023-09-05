import React, { Children, Fragment, memo, type PropsWithChildren } from 'react';
import classNames from 'classnames';

import useStyleSet from '../../hooks/useStyleSet';

type Props = PropsWithChildren<{
  // "defaultProps" is being deprecated.
  // eslint-disable-next-line react/require-default-props
  className?: string;
}>;

const Slotted = memo(({ children, className }: Props) => {
  const [{ slottedActivityStatus }] = useStyleSet();

  return (
    <span className={classNames('webchat__slotted-activity-status', slottedActivityStatus + '', className)}>
      {Children.map(children, (child, index) =>
        index ? (
          <Fragment>
            <span className="webchat__slotted-activity-status__pipe" role="presentation">
              {'|'}
            </span>
            {child}
          </Fragment>
        ) : (
          child
        )
      )}
    </span>
  );
});

Slotted.displayName = 'SlottedActivityStatus';

export default Slotted;
