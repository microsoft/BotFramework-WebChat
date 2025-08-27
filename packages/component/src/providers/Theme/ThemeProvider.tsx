import React, { memo, useContext, useMemo, type ReactNode } from 'react';

import Context, { type ThemeContextType } from './private/Context';

type Props = Readonly<{ children?: ReactNode | undefined } & Partial<ThemeContextType>>;

const EMPTY_ARRAY = Object.freeze([] as const);

const ThemeProvider = ({
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
  styles,
  toastMiddleware,
  typingIndicatorMiddleware
}: Props) => {
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

  const mergedStyleOptions = useMemo<ThemeContextType['styleOptions']>(
    () => Object.freeze({ ...styleOptions, ...existingContext.styleOptions }),
    [styleOptions, existingContext.styleOptions]
  );

  const mergedStyles = useMemo<ThemeContextType['styles']>(
    () => [...(existingContext.styles || EMPTY_ARRAY), ...(styles || EMPTY_ARRAY)],
    [styles, existingContext.styles]
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
      styleOptions: mergedStyleOptions,
      styles: mergedStyles,
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
      mergedStyleOptions,
      mergedStyles,
      mergedToastMiddleware,
      mergedTypingIndicatorMiddleware
    ]
  );

  return <Context.Provider value={context}>{children}</Context.Provider>;
};

export default memo(ThemeProvider);
