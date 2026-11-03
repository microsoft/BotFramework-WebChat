type CardActionWithImageAndTitle =
  | { image: string; title?: undefined }
  | { image?: undefined; title: string }
  | {
      image: string;
      title: string;
    };

/**
 * Web Chat-only `webchat:callUrl` action represents a hyperlink to be handled by the client.
 *
 * The hyperlink will be opened in a popup window to indicate its modality.
 * Return values from the popup are not currently handled by Web Chat.
 */
type WebChatCallURLCardAction = CardActionWithImageAndTitle & {
  type: 'webchat:callURL';
  value: string;
};

export { WebChatCallURLCardAction };
