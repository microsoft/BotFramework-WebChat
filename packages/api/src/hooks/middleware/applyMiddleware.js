import React, { isValidElement } from 'react';

import concatMiddleware from './concatMiddleware';
import ErrorBox from '../internal/ErrorBox';
import UserlandBoundary from './UserlandBoundary';

export default function applyMiddleware(type, ...middleware) {
  return (...setupArgs) =>
    concatMiddleware(...middleware)(...setupArgs)(() => {
      throw new Error(`reached terminator of ${type}`);
    });
}

export function forRenderer(type, { strict = false } = {}, ...middleware) {
  return (...setupArgs) => {
    const runMiddleware = concatMiddleware(...middleware)(...setupArgs)(() => (
      <ErrorBox error={new Error(`reached terminator of ${type}`)} type={type} />
    ));

    // The createRendererArgs is "what to render", for example, activity.
    // The function should return with only one of the two results:
    // - Returns a function if there is a renderer *committed* to render;
    // - Returns false if nothing should be rendered.
    return (...createRendererArgs) => {
      try {
        const render = runMiddleware(...createRendererArgs);

        if (!render) {
          return false;
        } else if (isValidElement(render)) {
          if (strict) {
            console.error(`botframework-webchat: ${type} should only return either false or a render function.`);

            return false;
          }

          return <UserlandBoundary type={`render of ${type}`}>{render}</UserlandBoundary>;
        } else {
          return (...renderTimeArgs) => (
            <UserlandBoundary type={`render of ${type}`}>
              {() => {
                try {
                  const element = render(...renderTimeArgs);

                  if (strict && !isValidElement(element)) {
                    console.error(`botframework-webchat: ${type} should return React element only.`);
                  }

                  return element;
                } catch (err) {
                  return <ErrorBox error={err} type={type} />;
                }
              }}
            </UserlandBoundary>
          );
        }
      } catch (err) {
        return <ErrorBox error={err} type={type} />;
      }
    };
  };
}
