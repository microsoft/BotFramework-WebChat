import React, { Children, Fragment, memo, type PropsWithChildren } from 'react';
import classNames from 'classnames';

type Props = Readonly<PropsWithChildren<{ className?: string }>>;

const Slotted = memo(({ children, className }: Props) => (
  <span className={classNames('webchat__activity-status--slotted', className)}>
    {Children.map(children, (child, index) =>
      // TODO: We may be able to do this in pure CSS, say, :not(:first-child)::before { content: '|' }.
      index ? (
        <Fragment>
          <span className="webchat__activity-status__slot-pipe" role="presentation">
            {'|'}
          </span>
          {child}
        </Fragment>
      ) : (
        child
      )
    )}
  </span>
));

Slotted.displayName = 'SlottedActivityStatus';

export default Slotted;
