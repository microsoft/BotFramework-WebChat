export { default as Composer, type ComposerProps } from '../Composer';
export { default as ReactWebChat, type ReactWebChatProps } from '../ReactWebChat';

// Components for restructuring BasicWebChat
export { default as BasicConnectivityStatus } from '../BasicConnectivityStatus';
export { default as BasicToaster } from '../BasicToaster';
export { default as BasicTranscript } from '../BasicTranscript';
export { default as BasicWebChat, type BasicWebChatProps } from '../BasicWebChat';
export { default as BasicSendBox } from '../SendBox/BasicSendBox';
export { default as BasicSendBoxToolbar } from '../SendBoxToolbar/BasicSendBoxToolbar';
export { default as AccessKeySinkSurface } from '../Utils/AccessKeySink/Surface';

// Components for recomposing activities and attachments
export { default as AudioContent } from '../Attachment/AudioContent';
export { default as FileContent } from '../Attachment/FileContent';
export { default as HTMLVideoContent } from '../Attachment/HTMLVideoContent';
export { default as ImageContent } from '../Attachment/ImageContent';
export { default as TextContent } from '../Attachment/Text/TextContent';
export { default as VideoContent } from '../Attachment/VideoContent';
export { default as VimeoContent } from '../Attachment/VimeoContent';
export { default as YouTubeContent } from '../Attachment/YouTubeContent';

// Components for recomposing transcript
export { default as Avatar } from '../Activity/Avatar';
export { default as Bubble } from '../Activity/Bubble';
export { default as SpeakActivity } from '../Activity/Speak';
export { default as SendStatus } from '../ActivityStatus/SendStatus/SendStatus';
export { default as Timestamp } from '../ActivityStatus/Timestamp';
export { default as ErrorBox } from '../ErrorBox';

// Components for recomposing send box
export { AttachmentBar } from '../SendBox/AttachmentBar/index';
export { default as DictationInterims } from '../SendBox/DictationInterims';
export { default as MicrophoneButton } from '../SendBox/MicrophoneButton';
export { default as SendButton } from '../SendBox/SendButton';
export { default as SuggestedActions } from '../SendBox/SuggestedActions';
export { default as SendTextBox } from '../SendBox/TextBox';
export { default as UploadButton } from '../SendBoxToolbar/UploadButton';
export { TextArea } from '../TextArea/index';

// Components for localization
export { default as LocalizedString } from '../Utils/LocalizedString';

// Components for theme packs
export { default as ThemeProvider } from '../providers/Theme/ThemeProvider';
