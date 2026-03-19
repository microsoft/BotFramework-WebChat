import {
  __INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol,
  avatarComponent,
  createAvatarPolymiddleware,
  type AvatarPolymiddleware
} from '@msinternal/botframework-webchat-api-middleware';
import { type LegacyAvatarMiddleware } from '@msinternal/botframework-webchat-api-middleware/legacy';
import { composeEnhancer } from 'handler-chain';
import React, { Fragment, memo, type ReactNode } from 'react';
import { custom, function_, never, object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';

type LegacyAvatarRenderFunction = () => Exclude<ReactNode, boolean | null | undefined>;

const legacyAvatarBridgeComponentPropsSchema = pipe(
  object({
    children: optional(never()),
    renderFn: custom<LegacyAvatarRenderFunction>(value => safeParse(function_(), value).success)
  }),
  readonly()
);

type LegacyAvatarBridgeComponentProps = Readonly<
  InferInput<typeof legacyAvatarBridgeComponentPropsSchema> & { children?: never }
>;

/**
 * Bridge component for the legacy avatar middleware.
 * Renders the result of the legacy render function.
 */
function LegacyAvatarBridge(props: LegacyAvatarBridgeComponentProps) {
  const { renderFn } = props;

  return <Fragment>{renderFn()}</Fragment>;
}

const MemoizedLegacyAvatarBridge = memo(LegacyAvatarBridge);

/**
 * Polyfill legacy avatar middleware into a polymiddleware.
 *
 * @deprecated Use `polymiddleware` instead. Legacy avatar middleware is being deprecated and will be removed on or after 2027-08-16.
 * @param middleware An array of legacy avatar middleware.
 * @returns A polymiddleware composed by legacy avatar middleware.
 */
function createAvatarPolymiddlewareFromLegacy(...middlewares: readonly LegacyAvatarMiddleware[]): AvatarPolymiddleware {
  const legacyEnhancer = composeEnhancer(...middlewares.map(middleware => middleware()));

  return createAvatarPolymiddleware(next => {
    const legacyHandler = legacyEnhancer(({ activity, fromUser, styleOptions }) => {
      // Pass styleOptions through the polymiddleware chain via the internal runtime extension
      // so downstream handlers (e.g. core middleware) can still read it.
      const handler = next(
        Object.freeze({
          activity,
          fromUser,
          [__INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol]: styleOptions
        })
      );

      // TODO: Warn if the result is wrong. Also add tests.
      // if (result !== false && typeof result !== 'function') {
      //   console.warn(
      //     'botframework-webchat: avatarMiddleware should return a function to render the avatar, or return false if avatar should be hidden. Please refer to HOOKS.md for details.'
      //   );

      //   return () => result;
      // }

      return !!handler && ((): Exclude<ReactNode, boolean | null | undefined> => handler.render({}));
    });

    return request => {
      const {
        activity,
        fromUser,
        [__INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol]: styleOptions
      } = request;

      const legacyResult = legacyHandler(Object.freeze({ activity, fromUser, styleOptions }));

      return legacyResult
        ? avatarComponent(MemoizedLegacyAvatarBridge, Object.freeze({ renderFn: legacyResult }))
        : undefined;
    };
  });
}

export default createAvatarPolymiddlewareFromLegacy;
export { legacyAvatarBridgeComponentPropsSchema, type LegacyAvatarBridgeComponentProps };
