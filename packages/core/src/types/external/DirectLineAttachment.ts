// https://github.com/Microsoft/botframework-sdk/blob/main/specs/botframework-activity/botframework-activity.md#attachment
type DirectLineAttachment = {
  // Currently, we allow "text/plain" with "content" field of type string. Under the spec, "content" must not contains primitive types.
  content?: any;
  contentType: string;
  contentUrl?: string;
  name?: string;
  thumbnailUrl?: string;
};

export type { DirectLineAttachment };
