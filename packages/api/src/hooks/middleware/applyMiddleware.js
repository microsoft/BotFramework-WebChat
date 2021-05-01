import React, { isValidElement } from 'react';
import ErrorBox from '../internal/ErrorBox';
import concatMiddleware from './concatMiddleware';
import UserlandBoundary from './UserlandBoundary';

export default function applyMiddleware(type, ...middleware) {
  return (...setupArgs) =>
    concatMiddleware(...middleware)(...setupArgs)(() => {
      throw new Error(`reached terminator of ${type}`);
    });
}

export function forLegacyRenderer(type, ...middleware) {
  return (...setupArgs) => {
    const fn = concatMiddleware(...middleware)(...setupArgs)(() => {
      throw new Error(`reached terminator of ${type}`);
    });

    return (...args) => (
      <UserlandBoundary type={`render of ${type}`}>
        {() => {
          try {
            return fn(...args);
          } catch (err) {
            return <ErrorBox error={err} type={`render of ${type}`} />;
          }
        }}
      </UserlandBoundary>
    );
  };
}

/**
 *
 * @param {string} type Required. String equivalent of type of container to be rendered.
 * @param { strict = false } - Used to enforce new middleware format which cooperates with new activity grouping.
 * @see See {@link https://github.com/microsoft/BotFramework-WebChat/blob/main/CHANGELOG.md#4100---2020-08-18} and {@link https://github.com/microsoft/BotFramework-WebChat/pull/3365} for middleware breaking changes.
 * @param  {middleware[]} middleware list of middleware to be applied.
 * 'createRendererArgs' is "what to render"; for example, an activity.
 * @returns  Returns a function if there is a renderer *committed* to render OR returns false if nothing should be rendered.
 */
export function forRenderer(type, { strict = false } = {}, ...middleware) {
  return (...setupArgs) => {
    const runMiddleware = concatMiddleware(...middleware)(...setupArgs)(() => (
      <ErrorBox error={new Error(`reached terminator of ${type}`)} type={type} />
    ));

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
        }

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
                return <ErrorBox error={err} type={`render of ${type}`} />;
              }
            }}
          </UserlandBoundary>
        );
      } catch (err) {
        return <ErrorBox error={err} type={`render of ${type}`} />;
      }
    };
  };
}
