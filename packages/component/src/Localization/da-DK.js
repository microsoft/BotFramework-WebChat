/* eslint no-magic-numbers: ["error", { "ignore": [1, 5, 24, 48, 60000, 3600000] }] */

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
    return 'Lige nu';
  } else if (deltaInMinutes === 1) {
    return 'Et minut siden';
  } else if (deltaInHours < 1) {
    return `${deltaInMinutes} minutter siden`;
  } else if (deltaInHours === 1) {
    return `En time siden`;
  } else if (deltaInHours < 5) {
    return `${deltaInHours} timer siden`;
  } else if (deltaInHours <= 24) {
    return `Idag`;
  } else if (deltaInHours <= 48) {
    return `Igår`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('da-DK').format(date);
  }

  return date.toLocaleString('da-DK', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function botSaidSomething(avatarInitials, text) {
  return `Bot ${avatarInitials} sagde, ${text}`;
}

function userSaidSomething(avatarInitials, text) {
  return `Bruger ${avatarInitials} sagde, ${text}`;
}

export default {
  FAILED_CONNECTION_NOTIFICATION: 'Kunne ikke tilslutte',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `ikke sendt, {Retry}.`,
  SLOW_CONNECTION_NOTIFICATION: 'Det tager længere tid at tilslutte end forventet',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  // '[File of type '%1']': '[File of type '%1']",
  // '[Unknown Card '%1']': '[Unknown Card '%1']',
  'Adaptive Card parse error': 'Adaptive Card parse fejl',
  'Adaptive Card render error': 'Adaptive Card renderings-fejl',
  Chat: 'Chat',
  'Download file': 'Hent fil',
  'Microphone off': 'Mikrofon slukket',
  'Microphone on': 'Mikrofon tændt',
  'Listening…': 'Lytter…',
  Left: 'Venstre',
  'New messages': 'Ny besked',
  Right: 'Højre',
  Retry: 'prøv igen',
  Sending: 'Sender',
  'Starting…': 'Starter...',
  Tax: 'Skat',
  Total: 'Total',
  VAT: 'Moms',
  Send: 'Send',
  Speak: 'Tal',
  'Upload file': 'Upload fil',
  'Type your message': 'Skriv din besked'
};
