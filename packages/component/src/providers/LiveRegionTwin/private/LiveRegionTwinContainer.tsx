import PropTypes from 'prop-types';
import React from 'react';

import type { VFC } from 'react';

import useStaticElements from './useStaticElements';
import useMarkAllAsRenderedEffect from './useMarkAllAsRenderedEffect';

type LiveRegionTwinContainerProps = {
  'aria-label'?: string;
  'aria-live': 'assertive' | 'polite';
  'aria-roledescription'?: string;
  className?: string;
  role?: string;
};

// This container is marked as private because we assume there is only one instance under the <LiveRegionTwinContext>.
const LiveRegionTwinContainer: VFC<LiveRegionTwinContainerProps> = ({
  'aria-label': ariaLabel,
  'aria-live': ariaLive,
  'aria-roledescription': ariaRoleDescription,
  className,
  role
}) => {
  const [staticElements] = useStaticElements();

  // We assume there is only one instance under the <LiveRegionTwinContext>.
  // The assumption made us safe to mark everything is rendered.
  // In contrary, if we have 0-to-many at different time, we may falsely mark something as rendered.
  useMarkAllAsRenderedEffect();

  // TODO: [P*] Add CSS to hide the live region.
  return (
    <div
      aria-label={ariaLabel}
      aria-live={ariaLive}
      aria-roledescription={ariaRoleDescription}
      className={className}
      role={role}
    >
      {/* TODO: [P*] Do we need "aria-atomic" for text content? */}
      {staticElements.map(element => (typeof element === 'string' ? <div aria-atomic={true}>{element}</div> : element))}
    </div>
  );
};

LiveRegionTwinContainer.defaultProps = {
  'aria-label': undefined,
  'aria-roledescription': undefined,
  className: undefined,
  role: undefined
};

LiveRegionTwinContainer.propTypes = {
  'aria-label': PropTypes.string,
  // PropTypes.oneOf() returns type of `string`, but not `'assertive' | 'polite'`.
  // @ts-ignore
  'aria-live': PropTypes.oneOf(['assertive', 'polite']).isRequired,
  'aria-roledescription': PropTypes.string,
  className: PropTypes.string,
  role: PropTypes.string
};

export default LiveRegionTwinContainer;
