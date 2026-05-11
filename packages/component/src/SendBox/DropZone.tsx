import { hooks } from 'botframework-webchat-api';
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

import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';

const { useLocalizer } = hooks;

const handleDragOver = (event: ReactDragEvent<unknown> | DragEvent) => {
  event.preventDefault();
};

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

const DROP_ZONE_STYLE = {
  '&.webchat__drop-zone': {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    border: '2px dashed #999',
    borderRadius: 4,
    cursor: 'copy',
    display: 'grid',
    gap: 8,
    inset: 0,
    placeContent: 'center',
    placeItems: 'center',
    position: 'absolute' as const,
    transition: 'background-color 0.2s ease',
    zIndex: 1,

    '&.webchat__drop-zone--droppable': {
      backgroundColor: 'rgba(0, 120, 212, 0.15)',
      borderColor: '#0078d4'
    }
  }
};

const DROP_ZONE_TEXT_STYLE = {
  '&.webchat__drop-zone__text': {
    fontSize: 14,
    fontWeight: 600,
    pointerEvents: 'none' as const
  }
};

type DropZoneProps = Readonly<{
  onFilesAdded: (files: File[]) => void;
}>;

function DropZone({ onFilesAdded }: DropZoneProps) {
  const [dropZoneState, setDropZoneState] = useState<false | 'visible' | 'droppable'>(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const localize = useLocalizer();
  const onFilesAddedRef = useRefFrom(onFilesAdded);
  const styleToEmotionObject = useStyleToEmotionObject();
  const dropZoneClassName = styleToEmotionObject(DROP_ZONE_STYLE) + '';
  const dropZoneTextClassName = styleToEmotionObject(DROP_ZONE_TEXT_STYLE) + '';

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
      className={`webchat__drop-zone ${dropZoneClassName}${dropZoneState === 'droppable' ? ' webchat__drop-zone--droppable' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      ref={dropZoneRef}
    >
      <span className={`webchat__drop-zone__text ${dropZoneTextClassName}`}>
        {localize('TEXT_INPUT_DROP_ZONE') || 'Drop files here'}
      </span>
    </div>
  ) : null;
}

export default memo(DropZone);
