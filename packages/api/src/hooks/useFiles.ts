import useWebChatAPIContext from './internal/useWebChatAPIContext';

/**
 * This is a hook that returns the files and setFiles from the context.
 */
export default function useFiles(): [{ files: File[]; setFiles: (files: File[]) => void }] {
  const { files, setFiles } = useWebChatAPIContext();

  return [{ files, setFiles }];
}
