/* eslint react/no-unused-prop-types: off */
/* eslint react/require-default-props: off */

import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import {
  type ActivityMiddleware,
  type ActivityStatusMiddleware,
  type AttachmentForScreenReaderMiddleware,
  type AttachmentMiddleware,
  type AvatarMiddleware,
  type CardActionMiddleware,
  type GroupActivitiesMiddleware,
  type ScrollToEndButtonMiddleware,
  type SendBoxMiddleware,
  type SendBoxToolbarMiddleware,
  type StyleOptions,
  type ToastMiddleware,
  type TypingIndicatorMiddleware
} from 'botframework-webchat-api';
import { StyleOptionsComposer } from 'botframework-webchat-api/internal';
import { type Polymiddleware } from 'botframework-webchat-api/middleware';
import React, { memo, useContext, useMemo, type ReactNode } from 'react';
import { array, custom, function_, object, optional, pipe, readonly, safeParse } from 'valibot';

import Context, { type ThemeContextType } from './private/Context';

const themeProviderPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    styleOptions: optional(custom<StyleOptions>(value => safeParse(object({}), value).success)),

    /** @deprecated Use `polymiddleware` instead, this will be removed on or after 2027-08-16. */
    activityMiddleware: optional(
      pipe(array(custom<ActivityMiddleware>(value => safeParse(function_(), value).success)))
    ),
    activityStatusMiddleware: optional(
      pipe(array(custom<ActivityStatusMiddleware>(value => safeParse(function_(), value).success)))
    ),
    attachmentForScreenReaderMiddleware: optional(
      pipe(array(custom<AttachmentForScreenReaderMiddleware>(value => safeParse(function_(), value).success)))
    ),
    attachmentMiddleware: optional(
      pipe(array(custom<AttachmentMiddleware>(value => safeParse(function_(), value).success)))
    ),
    avatarMiddleware: optional(pipe(array(custom<AvatarMiddleware>(value => safeParse(function_(), value).success)))),
    cardActionMiddleware: optional(
      pipe(array(custom<CardActionMiddleware>(value => safeParse(function_(), value).success)))
    ),
    groupActivitiesMiddleware: optional(
      pipe(array(custom<GroupActivitiesMiddleware>(value => safeParse(function_(), value).success)))
    ),
    polymiddleware: optional(pipe(array(custom<Polymiddleware>(value => safeParse(function_(), value).success)))),
    scrollToEndButtonMiddleware: optional(
      pipe(array(custom<ScrollToEndButtonMiddleware>(value => safeParse(function_(), value).success)))
    ),
    sendBoxMiddleware: optional(pipe(array(custom<SendBoxMiddleware>(value => safeParse(function_(), value).success)))),
    sendBoxToolbarMiddleware: optional(
      pipe(array(custom<SendBoxToolbarMiddleware>(value => safeParse(function_(), value).success)))
    ),
    toastMiddleware: optional(pipe(array(custom<ToastMiddleware>(value => safeParse(function_(), value).success)))),
    typingIndicatorMiddleware: optional(
      pipe(array(custom<TypingIndicatorMiddleware>(value => safeParse(function_(), value).success)))
    )
  }),
  readonly()
);

// We cannot use InferInput<> here because the array need to be readonly but InferInput omitted the readonly.
type ThemeProviderProps = {
  readonly children?: ReactNode | undefined;
  readonly styleOptions?: object | undefined;
  /** @deprecated Use `polymiddleware` instead, this will be removed on or after 2027-08-16. */
  readonly activityMiddleware?: readonly ActivityMiddleware[] | undefined;
  readonly activityStatusMiddleware?: readonly ActivityStatusMiddleware[] | undefined;
  readonly attachmentForScreenReaderMiddleware?: readonly AttachmentForScreenReaderMiddleware[] | undefined;
  readonly attachmentMiddleware?: readonly AttachmentMiddleware[] | undefined;
  readonly avatarMiddleware?: readonly AvatarMiddleware[] | undefined;
  readonly cardActionMiddleware?: readonly CardActionMiddleware[] | undefined;
  readonly groupActivitiesMiddleware?: readonly GroupActivitiesMiddleware[] | undefined;
  readonly polymiddleware?: readonly Polymiddleware[] | undefined;
  readonly scrollToEndButtonMiddleware?: readonly ScrollToEndButtonMiddleware[] | undefined;
  readonly sendBoxMiddleware?: readonly SendBoxMiddleware[] | undefined;
  readonly sendBoxToolbarMiddleware?: readonly SendBoxToolbarMiddleware[] | undefined;
  readonly toastMiddleware?: readonly ToastMiddleware[] | undefined;
  readonly typingIndicatorMiddleware?: readonly TypingIndicatorMiddleware[] | undefined;
};

const EMPTY_ARRAY = Object.freeze([] as const);

const ThemeProvider = (props: ThemeProviderProps) => {
  const {
    activityMiddleware,
    activityStatusMiddleware,
    attachmentForScreenReaderMiddleware,
    attachmentMiddleware,
    avatarMiddleware,
    cardActionMiddleware,
    children,
    groupActivitiesMiddleware,
    polymiddleware,
    scrollToEndButtonMiddleware,
    sendBoxMiddleware,
    sendBoxToolbarMiddleware,
    styleOptions,
    toastMiddleware,
    typingIndicatorMiddleware
  } = validateProps(themeProviderPropsSchema, props);

  const existingContext = useContext(Context);

  // TODO: [P1] We should reduce boilerplate code.
  const mergedActivityMiddleware = useMemo<ThemeContextType['activityMiddleware']>(
    () => Object.freeze([...(activityMiddleware || []), ...existingContext.activityMiddleware]),
    [activityMiddleware, existingContext.activityMiddleware]
  );

  const mergedActivityStatusMiddleware = useMemo<ThemeContextType['activityStatusMiddleware']>(
    () => Object.freeze([...(activityStatusMiddleware || EMPTY_ARRAY), ...existingContext.activityStatusMiddleware]),
    [activityStatusMiddleware, existingContext.activityStatusMiddleware]
  );

  const mergedAttachmentForScreenReaderMiddleware = useMemo<ThemeContextType['attachmentForScreenReaderMiddleware']>(
    () =>
      Object.freeze([
        ...(attachmentForScreenReaderMiddleware || EMPTY_ARRAY),
        ...existingContext.attachmentForScreenReaderMiddleware
      ]),
    [attachmentForScreenReaderMiddleware, existingContext.attachmentForScreenReaderMiddleware]
  );

  const mergedAttachmentMiddleware = useMemo<ThemeContextType['attachmentMiddleware']>(
    () => Object.freeze([...(attachmentMiddleware || EMPTY_ARRAY), ...existingContext.attachmentMiddleware]),
    [attachmentMiddleware, existingContext.attachmentMiddleware]
  );

  const mergedAvatarMiddleware = useMemo<ThemeContextType['avatarMiddleware']>(
    () => Object.freeze([...(avatarMiddleware || EMPTY_ARRAY), ...existingContext.avatarMiddleware]),
    [avatarMiddleware, existingContext.avatarMiddleware]
  );

  const mergedCardActionMiddleware = useMemo<ThemeContextType['cardActionMiddleware']>(
    () => Object.freeze([...(cardActionMiddleware || EMPTY_ARRAY), ...existingContext.cardActionMiddleware]),
    [cardActionMiddleware, existingContext.cardActionMiddleware]
  );

  const mergedGroupActivitiesMiddleware = useMemo<ThemeContextType['groupActivitiesMiddleware']>(
    () => Object.freeze([...(groupActivitiesMiddleware || EMPTY_ARRAY), ...existingContext.groupActivitiesMiddleware]),
    [groupActivitiesMiddleware, existingContext.groupActivitiesMiddleware]
  );

  const mergedPolymiddleware = useMemo<ThemeContextType['polymiddleware']>(
    () => Object.freeze([...(polymiddleware || EMPTY_ARRAY), ...existingContext.polymiddleware]),
    [polymiddleware, existingContext.polymiddleware]
  );

  const mergedScrollToEndButtonMiddleware = useMemo<ThemeContextType['scrollToEndButtonMiddleware']>(
    () =>
      Object.freeze([...(scrollToEndButtonMiddleware || EMPTY_ARRAY), ...existingContext.scrollToEndButtonMiddleware]),
    [scrollToEndButtonMiddleware, existingContext.scrollToEndButtonMiddleware]
  );

  const mergedSendBoxMiddleware = useMemo<ThemeContextType['sendBoxMiddleware']>(
    () => Object.freeze([...(sendBoxMiddleware || EMPTY_ARRAY), ...existingContext.sendBoxMiddleware]),
    [sendBoxMiddleware, existingContext.sendBoxMiddleware]
  );

  const mergedSendBoxToolbarMiddleware = useMemo<ThemeContextType['sendBoxToolbarMiddleware']>(
    () => Object.freeze([...(sendBoxToolbarMiddleware || EMPTY_ARRAY), ...existingContext.sendBoxToolbarMiddleware]),
    [sendBoxToolbarMiddleware, existingContext.sendBoxToolbarMiddleware]
  );

  const mergedToastMiddleware = useMemo<ThemeContextType['toastMiddleware']>(
    () => Object.freeze([...(toastMiddleware || EMPTY_ARRAY), ...existingContext.toastMiddleware]),
    [toastMiddleware, existingContext.toastMiddleware]
  );

  const mergedTypingIndicatorMiddleware = useMemo<ThemeContextType['typingIndicatorMiddleware']>(
    () => Object.freeze([...(typingIndicatorMiddleware || EMPTY_ARRAY), ...existingContext.typingIndicatorMiddleware]),
    [typingIndicatorMiddleware, existingContext.typingIndicatorMiddleware]
  );

  const context = useMemo(
    () => ({
      activityMiddleware: mergedActivityMiddleware,
      activityStatusMiddleware: mergedActivityStatusMiddleware,
      attachmentForScreenReaderMiddleware: mergedAttachmentForScreenReaderMiddleware,
      attachmentMiddleware: mergedAttachmentMiddleware,
      avatarMiddleware: mergedAvatarMiddleware,
      cardActionMiddleware: mergedCardActionMiddleware,
      groupActivitiesMiddleware: mergedGroupActivitiesMiddleware,
      polymiddleware: mergedPolymiddleware,
      scrollToEndButtonMiddleware: mergedScrollToEndButtonMiddleware,
      sendBoxMiddleware: mergedSendBoxMiddleware,
      sendBoxToolbarMiddleware: mergedSendBoxToolbarMiddleware,
      toastMiddleware: mergedToastMiddleware,
      typingIndicatorMiddleware: mergedTypingIndicatorMiddleware
    }),
    [
      mergedActivityMiddleware,
      mergedActivityStatusMiddleware,
      mergedAttachmentForScreenReaderMiddleware,
      mergedAttachmentMiddleware,
      mergedAvatarMiddleware,
      mergedCardActionMiddleware,
      mergedGroupActivitiesMiddleware,
      mergedPolymiddleware,
      mergedScrollToEndButtonMiddleware,
      mergedSendBoxMiddleware,
      mergedSendBoxToolbarMiddleware,
      mergedToastMiddleware,
      mergedTypingIndicatorMiddleware
    ]
  );

  return (
    <StyleOptionsComposer styleOptions={styleOptions}>
      <Context.Provider value={context}>{children}</Context.Provider>
    </StyleOptionsComposer>
  );
};

ThemeProvider.displayName = 'ThemeProvider';

export default memo(ThemeProvider);
export { themeProviderPropsSchema, type ThemeProviderProps };
