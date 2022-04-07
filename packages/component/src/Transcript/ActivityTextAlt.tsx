import PropTypes from 'prop-types';
import React from 'react';
import type { RefObject, VFC } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import ScreenReaderText from '../ScreenReaderText';
import useActivityAccessibleName from './useActivityAccessibleName';

type ActivityTextAltProps = {
  activity: WebChatActivity;
  bodyRef: RefObject<HTMLDivElement>;
  id: string;
};

const ActivityTextAlt: VFC<ActivityTextAltProps> = ({ activity, bodyRef, id }) => {
  const [accessibleName] = useActivityAccessibleName(activity, bodyRef);

  return <ScreenReaderText aria-hidden={true} id={id} text={accessibleName} />;
};

ActivityTextAlt.propTypes = {
  activity: PropTypes.any.isRequired,
  // PropTypes is not fully compatible with TypeScript
  // @ts-ignore
  bodyRef: PropTypes.shape({
    current: PropTypes.any
  }).isRequired,
  id: PropTypes.string.isRequired
};

export default ActivityTextAlt;
