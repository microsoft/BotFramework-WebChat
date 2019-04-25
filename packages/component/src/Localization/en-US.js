function botSaidSomething(avatarInitials, text, timestamp) {
  return `Bot ${ avatarInitials } said, ${ text }, ${ xMinutesAgo(timestamp) }`;
}

function userSaidSomething(avatarInitials, text, timestamp) {
  return `User ${ avatarInitials } said, ${ text }, ${ xMinutesAgo(timestamp) }`;
}

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
    return `${ deltaInMinutes } minutes ago`;
  } else if (deltaInHours === 1) {
    return `An hour ago`;
  } else if (deltaInHours < 5) {
    return `${ deltaInHours } hours ago`;
  } else if (deltaInHours <= 24) {
    return `Today`;
  } else if (deltaInHours <= 48) {
    return `Yesterday`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('en-US').format(date);
  } else {
    return date.toLocaleString('en-US', {
      day: '2-digit',
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}

export default {
  FAILED_CONNECTION_NOTIFICATION: 'Unable to connect.',
  INITIAL_CONNECTION_NOTIFICATION: 'Connecting…',
  INTERRUPTED_CONNECTION_NOTIFICATION: 'Network interruption occurred. Reconnecting…',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  RENDER_ERROR_NOTIFICATION: 'Render error. Please check the console or contact the bot developer.',
  SEND_FAILED_KEY: 'Send failed. {Retry}.',
  SLOW_CONNECTION_NOTIFICATION: 'Taking longer than usual to connect.',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  // '[File of type '%1']': '[File of type '%1']",
  // '[Unknown Card '%1']': '[Unknown Card '%1']',
  'Adaptive Card parse error' : 'Adaptive Card parse error',
  'Adaptive Card render error': 'Adaptive Card render error',
  'Chat': 'Chat',
  'Download file': 'Download file',
  'Microphone off': 'Microphone off',
  'Microphone on': 'Microphone on',
  'Left': 'Left',
  'Listening…': 'Listening…',
  'New messages': 'New messages',
  'Right': 'Right',
  'retry': 'retry',
  'Retry': 'Retry',
  'Send': 'Send',
  'Sending': 'Sending',
  'Speak': 'Speak',
  'Starting…': 'Starting…',
  'Tax': 'Tax',
  'Total': 'Total',
  'Type your message': 'Type your message',
  'Upload file': 'Upload file',
  'VAT': 'VAT'
}
