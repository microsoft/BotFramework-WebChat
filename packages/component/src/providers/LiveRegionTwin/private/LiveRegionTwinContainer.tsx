import PropTypes from 'prop-types';
import React, { Fragment } from 'react';

import type { VFC } from 'react';

import useMarkAllAsRenderedEffect from './useMarkAllAsRenderedEffect';
import useStaticElementEntries from './useStaticElementEntries';

type LiveRegionTwinContainerProps = {
  'aria-label'?: string;
  'aria-live': 'assertive' | 'polite';
  'aria-roledescription'?: string;
  className?: string;
  role?: string;
  textElementClassName?: string;
};

// This container is marked as private because we assume there is only one instance under the <LiveRegionTwinContext>.
const LiveRegionTwinContainer: VFC<LiveRegionTwinContainerProps> = ({
  'aria-label': ariaLabel,
  'aria-live': ariaLive,
  'aria-roledescription': ariaRoleDescription,
  className,
  role,
  textElementClassName
}) => {
  const [staticElementEntries] = useStaticElementEntries();

  // We assume there is only one instance under the <LiveRegionTwinContext>.
  // The assumption made us safe to mark everything is rendered.
  // In contrary, if we have 0-to-many at different time, we may falsely mark something as rendered.
  useMarkAllAsRenderedEffect();

  return (
    <div
      aria-label={ariaLabel}
      aria-live={ariaLive}
      aria-roledescription={ariaRoleDescription}
      className={className}
      role={role}
    >
      {staticElementEntries.map(({ element, key }) => {
        if (typeof element === 'string') {
          const id = `webchat__live-region-twin__text-element-${key}`;

          return (
            <div aria-atomic={true} aria-labelledby={id} className={textElementClassName} key={key}>
              {/* "aria-labelledby" requires the use of "id" attribute. */}
              {/* eslint-disable-next-line react/forbid-dom-props */}
              <p id={id}>{element}</p>
            </div>
          );
        }

        return <Fragment key={key}>{element}</Fragment>;
      })}
    </div>
  );
};

LiveRegionTwinContainer.defaultProps = {
  'aria-label': undefined,
  'aria-roledescription': undefined,
  className: undefined,
  role: undefined,
  textElementClassName: undefined
};

LiveRegionTwinContainer.propTypes = {
  'aria-label': PropTypes.string,
  // PropTypes.oneOf() returns type of `string`, but not `'assertive' | 'polite'`.
  // @ts-ignore
  'aria-live': PropTypes.oneOf(['assertive', 'polite']).isRequired,
  'aria-roledescription': PropTypes.string,
  className: PropTypes.string,
  role: PropTypes.string,
  textElementClassName: PropTypes.string
};

export default LiveRegionTwinContainer;
