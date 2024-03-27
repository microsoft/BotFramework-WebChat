import useWebChatAPIContext from './internal/useWebChatAPIContext';

/**
 * Manages the upload button ref so the value can be cleared from SendBoxComposer
 */
export default function useUploadButtonRef(): [
  {
    uploadButtonRef?: React.MutableRefObject<HTMLInputElement>;
  }
] {
  const { uploadButtonRef } = useWebChatAPIContext();

  return [{ uploadButtonRef }];
}
