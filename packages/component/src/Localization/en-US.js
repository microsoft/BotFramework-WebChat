/* eslint no-magic-numbers: ["error", { "ignore": [1, 5, 24, 48, 60000, 3600000] }] */

import getLocaleString from './getLocaleString';

function xMinutesAgo(dateStr) {
  const date = new Date(dateStr);
  const dateTime = date.getTime();

  if (isNaN(dateTime)) {
    return dateStr;
  }

  const now = Date.now();
  const deltaInMs = now - dateTime;
  const deltaInMinutes = Math.floor(deltaInMs / 60000);
  const deltaInHours = Math.floor(deltaInMs / 3600000);

  if (deltaInMinutes < 1) {
    return 'Just now';
  } else if (deltaInMinutes === 1) {
    return 'A minute ago';
  } else if (deltaInHours < 1) {
    return `${deltaInMinutes} minutes ago`;
  } else if (deltaInHours === 1) {
    return `An hour ago`;
  } else if (deltaInHours < 5) {
    return `${deltaInHours} hours ago`;
  } else if (deltaInHours <= 24) {
    return `Today`;
  } else if (deltaInHours <= 48) {
    return `Yesterday`;
  }
  return getLocaleString(date, 'en-US');
}

function botSaidSomething(avatarInitials, text) {
  return `Bot ${avatarInitials} said, ${text}`;
}

function downloadFileWithFileSize(downloadFileText, fileName, size) {
  // Full text should read: "Download file <filename> of size <filesize>"
  return `${downloadFileText} ${fileName} of size ${size}`;
}

function uploadFileWithFileSize(fileName, size) {
  return `${fileName} of size ${size}`;
}

function userSaidSomething(avatarInitials, text) {
  return `User ${avatarInitials} said, ${text}`;
}

export default {
  CONNECTED_NOTIFICATION: 'Connected',
  FAILED_CONNECTION_NOTIFICATION: 'Unable to connect.',
  INITIAL_CONNECTION_NOTIFICATION: 'Connecting…',
  INTERRUPTED_CONNECTION_NOTIFICATION: 'Network interruption occurred. Reconnecting…',
  RENDER_ERROR_NOTIFICATION: 'Render error. Please check the console or contact the bot developer.',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `Send failed. {Retry}.`,
  SLOW_CONNECTION_NOTIFICATION: 'Taking longer than usual to connect.',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  // '[File of type '%1']': '[File of type '%1']",
  // '[Unknown Card '%1']': '[Unknown Card '%1']',
  'Adaptive Card parse error': 'Adaptive Card parse error',
  'Adaptive Card render error': 'Adaptive Card render error',
  BotSent: 'Bot sent: ',
  Chat: 'Chat',
  'Download file': 'Download file',
  DownloadFileWithFileSize: downloadFileWithFileSize,
  ErrorMessage: 'Error message',
  'Microphone off': 'Microphone off',
  'Microphone on': 'Microphone on',
  Left: 'Left',
  'Listening…': 'Listening…',
  'New messages': 'New messages',
  Retry: 'Retry',
  Right: 'Right',
  Send: 'Send',
  SendBox: 'Sendbox',
  Sending: 'Sending',
  SendStatus: 'Send status: ',
  SentAt: 'Sent at: ',
  Speak: 'Speak',
  'Starting…': 'Starting…',
  Tax: 'Tax',
  Total: 'Total',
  'Type your message': 'Type your message',
  TypingIndicator: 'Showing typing indicator',
  'Upload file': 'Upload file',
  UploadFileWithFileSize: uploadFileWithFileSize,
  UserSent: 'User sent: ',
  VAT: 'VAT'
};
