import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEventHandler,
  type DragEvent as ReactDragEvent
} from 'react';
import { useRefFrom } from 'use-ref-from';

type DropZoneState = false | 'visible' | 'droppable';

const isFilesTransferEvent = (event: DragEvent) =>
  !!event.dataTransfer?.types?.some(type => type.toLowerCase() === 'files');

const isOrIsDescendantOf = (target: unknown, ancestor: Node | null): boolean => {
  if (!ancestor) {
    return false;
  }

  if (target === ancestor) {
    return true;
  }

  if (!(target instanceof HTMLElement)) {
    return false;
  }

  let current: Node | null = target;
  while ((current = current.parentNode)) {
    if (current === ancestor) {
      return true;
    }
  }

  return false;
};

/**
 * Shared drag-and-drop state management hook for file drop zones.
 * Manages global document event listeners and drop zone state.
 *
 * @param onFilesAdded - Callback invoked when files are dropped
 * @returns Object containing dropZoneState, dropZoneRef, and event handlers
 */
function useFileDropZone(onFilesAdded: (files: readonly File[]) => void): Readonly<{
  dropZoneState: DropZoneState;
  dropZoneRef: React.RefObject<HTMLDivElement>;
  handleDragOver: DragEventHandler<unknown>;
  handleDrop: DragEventHandler<HTMLDivElement>;
}> {
  const [dropZoneState, setDropZoneState] = useState<DropZoneState>(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const onFilesAddedRef = useRefFrom(onFilesAdded);

  // Prevent default dragover behavior to enable drop event triggering.
  // Browsers require this to fire subsequent drop events - without it,
  // they would handle the drop directly (e.g., open files in new tabs).
  // This is needed regardless of whether we prevent default drop behavior,
  // as it ensures our dropzone receives the drop event first. If we allow
  // default drop handling (by not calling preventDefault there), the browser
  // will still process the drop after our event handlers complete.
  const handleDragOver = useCallback((event: ReactDragEvent<unknown> | DragEvent) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    let entranceCounter = 0;

    const handleDragEnter = (event: DragEvent) => {
      document.addEventListener('dragover', handleDragOver);

      entranceCounter++;

      if (isFilesTransferEvent(event)) {
        setDropZoneState(isOrIsDescendantOf(event.target, dropZoneRef.current) ? 'droppable' : 'visible');
      }
    };

    const handleDragLeave = () => --entranceCounter <= 0 && setDropZoneState(false);

    const handleDragEnd = () => {
      document.removeEventListener('dragover', handleDragOver);

      entranceCounter = 0;

      setDropZoneState(false);
    };

    const handleDocumentDrop = (event: DragEvent) => {
      if (!dropZoneRef.current?.contains(event.target as Node)) {
        handleDragEnd();
      }
    };

    document.addEventListener('dragend', handleDragEnd);
    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDocumentDrop);

    return () => {
      document.removeEventListener('dragend', handleDragEnd);
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDocumentDrop);
    };
  }, [handleDragOver, setDropZoneState]);

  const handleDrop = useCallback<DragEventHandler<HTMLDivElement>>(
    event => {
      event.preventDefault();

      setDropZoneState(false);

      if (!isFilesTransferEvent(event.nativeEvent)) {
        return;
      }

      onFilesAddedRef.current(Object.freeze(Array.from(event.dataTransfer.files)));
    },
    [onFilesAddedRef]
  );

  return useMemo(
    () =>
      Object.freeze({
        dropZoneRef,
        dropZoneState,
        handleDragOver,
        handleDrop
      }),
    [dropZoneRef, dropZoneState, handleDragOver, handleDrop]
  );
}

export default useFileDropZone;
export { type DropZoneState };
