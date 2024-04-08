import React, {
  type ChangeEventHandler,
  type DragEventHandler,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { hooks } from 'botframework-webchat-api';
import { ToolbarButton } from './Toolbar';
import { AttachmentIcon } from '../../icons/AttachmentIcon';
import { AddDocumentIcon } from '../../icons/AddDocumentIcon';
import { useStyles } from '../../styles';

const { useLocalizer } = hooks;

const styles = {
  'webchat__sendbox__add-attachment': {
    display: 'grid'
  },

  'webchat__sendbox__add-attachment-input': {
    fontSize: 0,
    width: 0,
    height: 0
  },

  webchat__sendbox__attachment: {
    border: '1px solid var(--colorNeutralStroke1)',
    padding: '6px 8px',
    borderRadius: 'var(--borderRadiusLarge)',
    cursor: 'default',
    width: 'fit-content'
  },

  'webchat__sendbox__attachment-dropzone': {
    position: 'absolute',
    inset: '0',
    backgroundColor: 'var(--colorNeutralBackground4)',
    display: 'grid',
    placeItems: 'center',
    placeContent: 'center',
    gap: '8px',
    borderRadius: 'inherit',
    cursor: 'copy'
  },

  'webchat__sendbox__attachment-dropzone-icon': {
    width: '36px',
    height: '36px'
  }
};

export function AddAttachmentButton(props: {
  readonly disabled?: boolean | undefined;
  readonly icon?: ReactNode | undefined;
  readonly onFilesAdded: ((files: File[]) => void) | undefined;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const classnames = useStyles(styles);
  const localize = useLocalizer();

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback<ChangeEventHandler<HTMLInputElement>>(({ target: { files } }) => {
    if (files) {
      props.onFilesAdded?.(Array.from(files));
    }

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return (
    <div className={classnames['webchat__sendbox__add-attachment']}>
      <input
        aria-disabled={props.disabled}
        aria-hidden="true"
        className={classnames['webchat__sendbox__add-attachment-input']}
        multiple={true}
        onInput={props.disabled ? undefined : handleFileChange}
        readOnly={props.disabled}
        ref={inputRef}
        role="button"
        tabIndex={-1}
        type="file"
      />
      <ToolbarButton aria-label={localize('TEXT_INPUT_UPLOAD_BUTTON_ALT')} onClick={handleClick}>
        {props.icon ?? <AttachmentIcon />}
      </ToolbarButton>
    </div>
  );
}

export function Attachments({ files }: { readonly files: File[] }) {
  const classnames = useStyles(styles);
  const localize = useLocalizer();
  return files.length ? (
    <div className={classnames.webchat__sendbox__attachment}>
      {files.length} {localize('TEXT_INPUT_ATTACHMENTS')}
    </div>
  ) : null;
}

const handleDragOver: DragEventHandler<HTMLDivElement> = event => {
  event.stopPropagation();
  event.preventDefault();
};

const isFilesTransferEvent = (event: DragEvent) => !!event?.dataTransfer?.types?.includes?.('Files');

export function AttachmentDropzone(props: { readonly onFilesAdded: (files: File[]) => void }) {
  const classnames = useStyles(styles);
  const [showDropZone, setShowDropZone] = useState<boolean>(false);
  const localize = useLocalizer();

  useEffect(() => {
    const handleDragEnd = () => {
      setShowDropZone(false);
    };
    const handleDragStart = (event: DragEvent) => {
      if (!isFilesTransferEvent(event)) {
        return;
      }
      setShowDropZone(true);
      document.addEventListener('click', handleDragEnd, {
        once: true,
        capture: true
      });
    };

    document.addEventListener('dragenter', handleDragStart, false);
    document.addEventListener('dragend', handleDragEnd, false);
    return () => {
      document.removeEventListener('dragenter', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  const handleDrop = useCallback<DragEventHandler<HTMLDivElement>>(event => {
    event.preventDefault();
    setShowDropZone(false);
    if (!isFilesTransferEvent(event.nativeEvent)) {
      return;
    }
    props.onFilesAdded(Array.from(event.dataTransfer.files));
  }, []);

  return showDropZone ? (
    <div
      className={classnames['webchat__sendbox__attachment-dropzone']}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <AddDocumentIcon className={classnames['webchat__sendbox__attachment-dropzone-icon']} />
      <span>{localize('TEXT_INPUT_DROP_ZONE')}</span>
    </div>
  ) : null;
}
