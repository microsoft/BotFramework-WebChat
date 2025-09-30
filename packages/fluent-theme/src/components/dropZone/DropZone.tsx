import { hooks } from 'botframework-webchat';
import cx from 'classnames';
import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEventHandler,
  type DragEvent as ReactDragEvent
} from 'react';
import { useRefFrom } from 'use-ref-from';

import { useStyles } from '../../styles';
import testIds from '../../testIds';
import { FluentIcon } from '../icon';
import styles from './DropZone.module.css';

const { useLocalizer } = hooks;

const handleDragOver = (event: ReactDragEvent<unknown> | DragEvent) => {
  // Prevent default dragover behavior to enable drop event triggering.
  // Browsers require this to fire subsequent drop events - without it,
  // they would handle the drop directly (e.g., open files in new tabs).
  // This is needed regardless of whether we prevent default drop behavior,
  // as it ensures our dropzone receives the drop event first. If we allow
  // default drop handling (by not calling preventDefault there), the browser
  // will still process the drop after our event handlers complete.
  event.preventDefault();
};

// Notes: For files dragging from outside of browser, it only tell us if it is a "File" instead of "text/plain" or "text/uri-list".
//        For images dragging inside of browser, it only tell us that it is "text/plain", "text/uri-list" and "text/html". But not "image/*".
//        So we cannot allowlist what is droppable.
//        We are using case-insensitive of type "files" so we can drag in WebDriver.
const isFilesTransferEvent = (event: DragEvent) =>
  !!event.dataTransfer?.types?.some(type => type.toLowerCase() === 'files');

function isDescendantOf(target: Node, ancestor: Node): boolean {
  let current = target.parentNode;

  while (current) {
    if (current === ancestor) {
      return true;
    }

    current = current.parentNode;
  }

  return false;
}

const DropZone = (props: { readonly onFilesAdded: (files: File[]) => void }) => {
  const [dropZoneState, setDropZoneState] = useState<false | 'visible' | 'droppable'>(false);
  const classNames = useStyles(styles);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const localize = useLocalizer();
  const onFilesAddedRef = useRefFrom(props.onFilesAdded);

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
  }, [setDropZoneState]);

  const handleDrop = useCallback<DragEventHandler<HTMLDivElement>>(
    event => {
      event.preventDefault();

      setDropZoneState(false);

      if (!isFilesTransferEvent(event.nativeEvent)) {
        return;
      }

      onFilesAddedRef.current([...event.dataTransfer.files]);
    },
    [onFilesAddedRef, setDropZoneState]
  );

  return dropZoneState ? (
    <div
      className={cx(classNames['sendbox__attachment-drop-zone'], {
        [classNames['sendbox__attachment-drop-zone--droppable']]: dropZoneState === 'droppable'
      })}
      data-testid={testIds.sendBoxDropZone}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      ref={dropZoneRef}
    >
      <FluentIcon appearance="text" className={classNames['sendbox__attachment-drop-zone-icon']} icon="add-document" />
      {localize('TEXT_INPUT_DROP_ZONE')}
    </div>
  ) : null;
};

DropZone.displayName = 'DropZone';

export default memo(DropZone);
