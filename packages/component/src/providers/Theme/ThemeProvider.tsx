import React, { memo, useContext, useMemo, type ReactNode } from 'react';

import Context, { type ContextType } from './private/Context';

type Props = Readonly<{ children?: ReactNode | undefined } & Partial<ContextType>>;

const EMPTY_ARRAY = Object.freeze([] as const);

const ThemeProvider = ({
  children,
  activityMiddleware,
  activityStatusMiddleware,
  attachmentForScreenReaderMiddleware,
  attachmentMiddleware,
  avatarMiddleware,
  cardActionMiddleware,
  groupActivitiesMiddleware,
  scrollToEndButtonMiddleware,
  styleOptions,
  toastMiddleware,
  typingIndicatorMiddleware
}: Props) => {
  const existingContext = useContext(Context);

  const mergedActivityMiddleware = useMemo<ContextType['activityMiddleware']>(
    () => Object.freeze([...(activityMiddleware || []), ...existingContext.activityMiddleware]),
    [activityMiddleware, existingContext.activityMiddleware]
  );

  const mergedActivityStatusMiddleware = useMemo<ContextType['activityStatusMiddleware']>(
    () => Object.freeze([...(activityStatusMiddleware || EMPTY_ARRAY), ...existingContext.activityStatusMiddleware]),
    [activityStatusMiddleware, existingContext.activityStatusMiddleware]
  );

  const mergedAttachmentForScreenReaderMiddleware = useMemo<ContextType['attachmentForScreenReaderMiddleware']>(
    () =>
      Object.freeze([
        ...(attachmentForScreenReaderMiddleware || EMPTY_ARRAY),
        ...existingContext.attachmentForScreenReaderMiddleware
      ]),
    [attachmentForScreenReaderMiddleware, existingContext.attachmentForScreenReaderMiddleware]
  );

  const mergedAttachmentMiddleware = useMemo<ContextType['attachmentMiddleware']>(
    () => Object.freeze([...(attachmentMiddleware || EMPTY_ARRAY), ...existingContext.attachmentMiddleware]),
    [attachmentMiddleware, existingContext.attachmentMiddleware]
  );

  const mergedAvatarMiddleware = useMemo<ContextType['avatarMiddleware']>(
    () => Object.freeze([...(avatarMiddleware || EMPTY_ARRAY), ...existingContext.avatarMiddleware]),
    [avatarMiddleware, existingContext.avatarMiddleware]
  );

  const mergedCardActionMiddleware = useMemo<ContextType['cardActionMiddleware']>(
    () => Object.freeze([...(cardActionMiddleware || EMPTY_ARRAY), ...existingContext.cardActionMiddleware]),
    [cardActionMiddleware, existingContext.cardActionMiddleware]
  );

  const mergedGroupActivitiesMiddleware = useMemo<ContextType['groupActivitiesMiddleware']>(
    () => Object.freeze([...(groupActivitiesMiddleware || EMPTY_ARRAY), ...existingContext.groupActivitiesMiddleware]),
    [groupActivitiesMiddleware, existingContext.groupActivitiesMiddleware]
  );

  const mergedScrollToEndButtonMiddleware = useMemo<ContextType['scrollToEndButtonMiddleware']>(
    () =>
      Object.freeze([...(scrollToEndButtonMiddleware || EMPTY_ARRAY), ...existingContext.scrollToEndButtonMiddleware]),
    [scrollToEndButtonMiddleware, existingContext.scrollToEndButtonMiddleware]
  );

  const mergedStyleOptions = useMemo<ContextType['styleOptions']>(
    () => Object.freeze({ ...styleOptions, ...existingContext.styleOptions }),
    [styleOptions, existingContext.styleOptions]
  );

  const mergedToastMiddleware = useMemo<ContextType['toastMiddleware']>(
    () => Object.freeze([...(toastMiddleware || EMPTY_ARRAY), ...existingContext.toastMiddleware]),
    [toastMiddleware, existingContext.toastMiddleware]
  );

  const mergedTypingIndicatorMiddleware = useMemo<ContextType['typingIndicatorMiddleware']>(
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
      scrollToEndButtonMiddleware: mergedScrollToEndButtonMiddleware,
      styleOptions: mergedStyleOptions,
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
      mergedScrollToEndButtonMiddleware,
      mergedStyleOptions,
      mergedToastMiddleware,
      mergedTypingIndicatorMiddleware
    ]
  );

  return <Context.Provider value={context}>{children}</Context.Provider>;
};

export default memo(ThemeProvider);
