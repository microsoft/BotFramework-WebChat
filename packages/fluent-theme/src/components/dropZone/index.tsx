import { hooks } from 'botframework-webchat-component';
import cx from 'classnames';
import React, { memo, useCallback, useEffect, useRef, useState, type DragEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';

import { AddDocumentIcon } from '../../icons/AddDocumentIcon';
import testIds from '../../testIds';
import styles from './index.module.css';
import { useStyles } from '../../styles';

const { useLocalizer } = hooks;

const handleDragOver: DragEventHandler<HTMLDivElement> = event => {
  // This is for preventing the browser from opening the dropped file in a new tab.
  event.preventDefault();
};

// Notes: For files dragging from outside of browser, it only tell us if it is a "File" instead of "text/plain" or "text/uri-list".
//        For images dragging inside of browser, it only tell us that it is "text/plain", "text/uri-list" and "text/html". But not "image/*".
//        So we cannot whitelist what is droppable.
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

    document.addEventListener('dragenter', handleDragEnter, false);
    document.addEventListener('dragleave', handleDragLeave, false);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragleave', handleDragLeave);
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
      className={cx(classNames['webchat-fluent__sendbox__attachment-drop-zone'], {
        [classNames['webchat-fluent__sendbox__attachment-drop-zone--droppable']]: dropZoneState === 'droppable'
      })}
      data-testid={testIds.sendBoxDropZone}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      ref={dropZoneRef}
    >
      <AddDocumentIcon className={classNames['webchat-fluent__sendbox__attachment-drop-zone-icon']} />
      {localize('TEXT_INPUT_DROP_ZONE')}
    </div>
  ) : null;
};

DropZone.displayName = 'DropZone';

export default memo(DropZone);
