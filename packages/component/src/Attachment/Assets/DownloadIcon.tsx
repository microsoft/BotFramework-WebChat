import { validateProps } from 'botframework-webchat-api/internal';
import React, { memo } from 'react';
import { number, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

const ICON_SIZE_FACTOR = 22;

const downloadIconPropsSchema = pipe(
  object({
    className: optional(string()),
    size: optional(number(), 1)
  }),
  readonly()
);

type DownloadIconProps = InferInput<typeof downloadIconPropsSchema>;

const DownloadIcon = (props: DownloadIconProps) => {
  const { className, size } = validateProps(downloadIconPropsSchema, props, 'strict');

  return (
    <svg
      className={className}
      focusable={false}
      height={ICON_SIZE_FACTOR * size}
      role="presentation"
      viewBox="0 0 31.8 46"
      width={ICON_SIZE_FACTOR * size}
    >
      <path d="M26.8,23.8l-10.9,11L5,23.8l1.6-1.6l8.2,8.3V5H17v25.5l8.2-8.3L26.8,23.8z M5.8,41v-2.2H26V41H5.8z" />
    </svg>
  );
};

export default memo(DownloadIcon);
export { downloadIconPropsSchema, type DownloadIconProps };
