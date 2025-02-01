import * as React from 'react';
import useRenderAttachment from '../hooks/useRenderAttachment';

const v2MiddlewareSymbol = Symbol('WebChat-v2-middleware');

export function isV2Middleware(fn: any) {
  return fn instanceof Function && v2MiddlewareSymbol in fn;
}

export function v2Middleware<F extends (...args: any[]) => any>(fn: F): F {
  return Object.assign(fn, { [v2MiddlewareSymbol]: true });
}

// TODO: improve types in code bellow

function v2MiddlewareShim<S extends any[]>(v1Middleware, middlewareTypeHandler) {
  return (...init: S) => {
    const enhancer = v1Middleware(...init);
    return next => {
      // handle calling next from v1 in v2
      const nextShim = (props, ...args) => {
        if (args.length) {
          throw new Error('Additional arguments in next() are not supported when using v2 middlewares');
        }
        const Next = next(props);
        if (!Next) {
          return false;
        }
        return middlewareTypeHandler.v1(Next);
      };
      const fn = enhancer(nextShim);
      return props => {
        const result = fn(props);
        if (!result) {
          return false;
        }
        return middlewareTypeHandler.v2(result);
      };
    };
  };
}

export const middlewareTypeShim = {
  activity: {
    v2: result =>
      function ActivityRendererShim(props) {
        // renderAttachmentOverride is not supported anymore
        const renderAttachment = useRenderAttachment();
        return result instanceof Function ? result(renderAttachment, props) : result;
      },
    v1: Next =>
      function renderActivity(legacyRenderAttachment, props) {
        return <Next renderAttachment={legacyRenderAttachment} {...props} />;
      }
  }
} as const;

export function applyV2MiddlewareShim(middlewaress, shimType) {
  return middlewaress.map(md => (isV2Middleware(md) ? md : v2MiddlewareShim(md, shimType)));
}
