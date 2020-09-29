import React from 'react';

import concatMiddleware from './concatMiddleware';
import ErrorBox from '../internal/ErrorBox';
import UserlandBoundary from './UserlandBoundary';

export default function applyMiddleware(type, ...middleware) {
  return (...setupArgs) =>
    concatMiddleware(...middleware)(...setupArgs)(() => {
      throw new Error(`reached terminator of ${type}`);
    });
}

export function forRenderer(type, ...middleware) {
  return (...setupArgs) => {
    const runMiddleware = concatMiddleware(...middleware)(...setupArgs)(() => (
      <ErrorBox error={err} message={`reached terminator of ${type}`} />
    ));

    // console.log('forRenderer.runMiddleware', { runMiddleware, setupArgs });

    // The createRendererArgs is "what to render", for example, activity.
    // The function should return with only one of the two results:
    // - Returns a function if there is a renderer *committed* to render;
    // - Returns false if nothing should be rendered.
    return (...createRendererArgs) => {
      try {
        const render = runMiddleware(...createRendererArgs);

        // console.log(`forRenderer[${type}]`, { args: createRendererArgs, render });

        if (!render) {
          return false;
        } else if (React.isValidElement(render)) {
          return <UserlandBoundary type={`render of ${type}`}>{render}</UserlandBoundary>;
        } else {
          return ((...renderTimeArgs) => {
            // console.log(`forRenderer.render[${type}]`, { render, renderTimeArgs });

            return <UserlandBoundary type={`render of ${type}`}>{render(...renderTimeArgs)}</UserlandBoundary>;
          })
        }

        return (
          !!render &&
          // The renderTimeArgs is for "styling" or render-time arguments.
          // These arguments must not cause the renderer hiding the element (a.k.a. not rendering).
          // For example:
          // - Should we show/hide the timestamp while rendering this activity?
          ((...renderTimeArgs) => {
            // console.log(`forRenderer.render[${type}]`, { render, renderTimeArgs });

            return <UserlandBoundary type={`render of ${type}`}>{render(...renderTimeArgs)}</UserlandBoundary>;
          })
        );
      } catch (err) {
        // The next line is not a React component. It is a render function.
        // eslint-disable-next-line react/display-name
        return () => <ErrorBox error={err} message={`initialization of ${type}`} />;
      }
    };
  };
}
