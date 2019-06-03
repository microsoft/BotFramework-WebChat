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
    return 'Alldeles nyss';
  } else if (deltaInMinutes === 1) {
    return 'För en minut sen';
  } else if (deltaInHours < 1) {
    return `${deltaInMinutes} minuter sedan`;
  } else if (deltaInHours === 1) {
    return `En timme sen`;
  } else if (deltaInHours < 5) {
    return `${deltaInHours} timmar sen`;
  } else if (deltaInHours <= 24) {
    return `Idag`;
  } else if (deltaInHours <= 48) {
    return `Igår`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('sv-SE').format(date);
  }

  return date.toLocaleString('sv-SE', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function botSaidSomething(avatarInitials, text) {
  return `Bot ${avatarInitials} sa, ${text}`;
}

function userSaidSomething(avatarInitials, text) {
  return `Användare ${avatarInitials} sa, ${text}`;
}

export default {
  FAILED_CONNECTION_NOTIFICATION: 'Kunde inte ansluta.',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `kunde inte skicka, {Retry}.`,
  SLOW_CONNECTION_NOTIFICATION: 'Det tar längre än vanligt att ansluta.',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  // '[File of type '%1']': '[File of type '%1']",
  // '[Unknown Card '%1']': '[Unknown Card '%1']',
  'Adaptive Card parse error': 'Adaptive Card parse error',
  'Adaptive Card render error': 'Adaptive Card render error',
  Chat: 'Chatt',
  'Download file': 'Ladda ned fil',
  'Microphone off': 'Mikrofon av',
  'Microphone on': 'Mikrofon på',
  Left: 'Vänster',
  'Listening…': 'Lyssnar…',
  'New messages': 'Nya meddelanden',
  Right: 'Höger',
  Retry: 'försök igen',
  Send: 'Skicka',
  Sending: 'Skickar',
  Speak: 'Läs upp',
  'Starting…': 'Startar…',
  Tax: 'Skatt',
  Total: 'Totalt',
  'Type your message': 'Skriv ditt meddelande',
  'Upload file': 'Ladd upp fil',
  VAT: 'Moms'
};
