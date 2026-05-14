import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEventHandler,
  type DragEvent as ReactDragEvent
} from 'react';
import { useRefFrom } from 'use-ref-from';

type DropZoneState = false | 'visible' | 'droppable';

/**
 * Shared drag-and-drop state management hook for file drop zones.
 * Manages global document event listeners and drop zone state.
 *
 * @param onFilesAdded - Callback invoked when files are dropped
 * @returns Object containing dropZoneState, dropZoneRef, and event handlers
 */
function useFileDropZone(onFilesAdded: (files: File[]) => void) {
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

  // Notes: For files dragging from outside of browser, it only tell us if it is a "File" instead of "text/plain" or "text/uri-list".
  //        For images dragging inside of browser, it only tell us that it is "text/plain", "text/uri-list" and "text/html". But not "image/*".
  //        So we cannot allowlist what is droppable.
  //        We are using case-insensitive of type "files" so we can drag in WebDriver.
  const isFilesTransferEvent = useCallback(
    (event: DragEvent) => !!event.dataTransfer?.types?.some(type => type.toLowerCase() === 'files'),
    []
  );

  const isDescendantOf = useCallback((target: Node, ancestor: Node): boolean => {
    let current = target.parentNode;

    while (current) {
      if (current === ancestor) {
        return true;
      }

      current = current.parentNode;
    }

    return false;
  }, []);

  useEffect(() => {
    let entranceCounter = 0;

    const handleDragEnter = (event: DragEvent) => {
      document.addEventListener('dragover', handleDragOver);

      entranceCounter++;

      if (isFilesTransferEvent(event)) {
        setDropZoneState(
          dropZoneRef.current &&
            (event.target === dropZoneRef.current ||
              (event.target instanceof HTMLElement && isDescendantOf(event.target, dropZoneRef.current)))
            ? 'droppable'
            : 'visible'
        );
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
  }, [handleDragOver, isDescendantOf, isFilesTransferEvent, setDropZoneState]);

  const handleDrop = useCallback<DragEventHandler<HTMLDivElement>>(
    event => {
      event.preventDefault();

      setDropZoneState(false);

      if (!event.dataTransfer?.types?.some(type => type.toLowerCase() === 'files')) {
        return;
      }

      onFilesAddedRef.current(Array.from(event.dataTransfer.files));
    },
    [onFilesAddedRef, setDropZoneState]
  );

  return {
    dropZoneRef,
    dropZoneState,
    handleDragOver,
    handleDrop
  };
}

export default useFileDropZone;
export { type DropZoneState, useFileDropZone };
