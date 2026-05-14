import { hooks } from 'botframework-webchat-api';
import { useFileDropZone } from '@msinternal/botframework-webchat-react-hooks';
import React, { memo } from 'react';

import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import testIds from '../testIds';

const { useLocalizer } = hooks;

const DROP_ZONE_STYLE = {
  '&.webchat__drop-zone': {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    border: '2px dashed #999',
    borderRadius: 4,
    cursor: 'copy',
    display: 'grid',
    gap: 8,
    placeContent: 'center',
    placeItems: 'center',
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
  const { dropZoneRef, dropZoneState, handleDragOver, handleDrop } = useFileDropZone(onFilesAdded);
  const localize = useLocalizer();
  const styleToEmotionObject = useStyleToEmotionObject();
  const dropZoneClassName = styleToEmotionObject(DROP_ZONE_STYLE) + '';
  const dropZoneTextClassName = styleToEmotionObject(DROP_ZONE_TEXT_STYLE) + '';

  return dropZoneState ? (
    <div
      className={`webchat__drop-zone ${dropZoneClassName}${dropZoneState === 'droppable' ? ' webchat__drop-zone--droppable' : ''}`}
      data-testid={testIds.sendBoxDropZone}
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

DropZone.displayName = 'DropZone';

export default memo(DropZone);
