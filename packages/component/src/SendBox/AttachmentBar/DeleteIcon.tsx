import { validateProps } from 'botframework-webchat-api/internal';
import React, { memo } from 'react';
import { type InferInput, object, optional, picklist, pipe, readonly } from 'valibot';
import MonochromeImageMasker from '../../Utils/MonochromeImageMasker';

const deleteIconPropsSchema = pipe(
  object({
    size: optional(picklist(['large', 'small']))
  }),
  readonly()
);

type DeleteIconProps = InferInput<typeof deleteIconPropsSchema>;

const LARGE_ICON_SVG_URL = `data:image/svg+xml;utf8,${encodeURIComponent('<svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M4.60507 5.12706L4.66061 5.06059C4.82723 4.89396 5.08588 4.87545 5.27295 5.00505L5.33943 5.06059L9.80002 9.52128L14.2606 5.06059C14.4481 4.87314 14.752 4.87314 14.9394 5.06059C15.1269 5.24804 15.1269 5.55196 14.9394 5.73941L10.4787 10.2L14.9394 14.6606C15.1061 14.8272 15.1246 15.0859 14.995 15.2729L14.9394 15.3394C14.7728 15.506 14.5142 15.5245 14.3271 15.395L14.2606 15.3394L9.80002 10.8787L5.33943 15.3394C5.15198 15.5269 4.84806 15.5269 4.66061 15.3394C4.47316 15.152 4.47316 14.848 4.66061 14.6606L9.1213 10.2L4.66061 5.73941C4.49398 5.57279 4.47547 5.31414 4.60507 5.12706L4.66061 5.06059L4.60507 5.12706Z" fill="#242424" /></svg>')}`;
const SMALL_ICON_SVG_URL = `data:image/svg+xml;utf8,${encodeURIComponent('<svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M6.08859 6.21569L6.14645 6.14645C6.32001 5.97288 6.58944 5.9536 6.78431 6.08859L6.85355 6.14645L10 9.293L13.1464 6.14645C13.3417 5.95118 13.6583 5.95118 13.8536 6.14645C14.0488 6.34171 14.0488 6.65829 13.8536 6.85355L10.707 10L13.8536 13.1464C14.0271 13.32 14.0464 13.5894 13.9114 13.7843L13.8536 13.8536C13.68 14.0271 13.4106 14.0464 13.2157 13.9114L13.1464 13.8536L10 10.707L6.85355 13.8536C6.65829 14.0488 6.34171 14.0488 6.14645 13.8536C5.95118 13.6583 5.95118 13.3417 6.14645 13.1464L9.293 10L6.14645 6.85355C5.97288 6.67999 5.9536 6.41056 6.08859 6.21569L6.14645 6.14645L6.08859 6.21569Z" fill="#242424" /></svg>')}`;

function DeleteIcon(props: DeleteIconProps) {
  const { size } = validateProps(deleteIconPropsSchema, props);

  return (
    <MonochromeImageMasker
      className="webchat__send-box-attachment-bar-item__delete-icon-masker"
      src={size === 'large' ? LARGE_ICON_SVG_URL : SMALL_ICON_SVG_URL}
    />
  );
}

export default memo(DeleteIcon);
export { deleteIconPropsSchema, type DeleteIconProps };
