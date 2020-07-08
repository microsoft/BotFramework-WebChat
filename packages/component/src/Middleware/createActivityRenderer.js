/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import concatMiddleware from './concatMiddleware';
import createCoreActivityMiddleware from './Activity/createCoreMiddleware';
import ErrorBox from '../ErrorBox';
import useTrackException from '../hooks/useTrackException';

const SilentError = ({ message }) => {
  const trackException = useTrackException();

  useEffect(() => {
    trackException(new Error(message), false);
  }, [message, trackException]);

  return false;
};

SilentError.propTypes = {
  message: PropTypes.string.isRequired
};

export default function createActivityRenderer(additionalMiddleware) {
  const activityMiddleware = concatMiddleware(additionalMiddleware, createCoreActivityMiddleware())({});

  return (...args) => {
    try {
      return activityMiddleware(({ activity }) => () => (
        <SilentError message={`No activity found for type "${activity.type}".`} />
      ))(...args);
    } catch (err) {
      const FailedRenderActivity = () => (
        <ErrorBox error={err} message="Failed to render activity">
          <pre>{JSON.stringify(err, null, 2)}</pre>
        </ErrorBox>
      );

      return FailedRenderActivity;
    }
  };
}
