function botSaidSomething(avatarInitials, text, timestamp) {
  return `Bot ${ avatarInitials } said, ${ text }, ${ xMinutesAgo(timestamp) }`;
}

function userSaidSomething(avatarInitials, text, timestamp) {
  return `User ${ avatarInitials } said, ${ text }, ${ xMinutesAgo(timestamp) }`;
}

function xMinutesAgo(date) {
  const now = Date.now();
  const deltaInMs = now - new Date(date).getTime();
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
  } else {
    return new Intl.DateTimeFormat('en-US').format(date);
  }
}

export default {
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  ...[
    // '[File of type '%1']",
    // '[Unknown Card '%1']',
    'Adaptive Card parse error',
    'Adaptive Card render error',
    'Chat',
    'Download file',
    'Microphone off',
    'Microphone on',
    'Left',
    'Listening…',
    'New messages',
    'retry',
    'Right',
    // Do not localize {retry}, it is a placeholder for "retry"
    'Send failed, {retry}',
    'Send',
    'Sending',
    'Speak',
    'Starting…',
    'Tax',
    'Total',
    'Type your message',
    'Upload file',
    'VAT'
  ].reduce((result, text) => ({
    ...result,
    [text]: text
  }), {})
}
