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
    return 'Akkurat nå';
  } else if (deltaInMinutes === 1) {
    return 'Et minutt siden';
  } else if (deltaInHours < 1) {
    return `${deltaInMinutes} minutter siden`;
  } else if (deltaInHours === 1) {
    return `En time siden`;
  } else if (deltaInHours < 5) {
    return `${deltaInHours} timer siden`;
  } else if (deltaInHours <= 24) {
    return `I dag`;
  } else if (deltaInHours <= 48) {
    return `I går`;
  }
  return getLocaleString(date, 'nb-NO');
}

function botSaidSomething(avatarInitials, text) {
  return `Bot ${avatarInitials} sa, ${text}`;
}

function downloadFileWithFileSize(downloadFileText, fileName, size) {
  // Full text should read: "Download file <filename> of size <filesize>"
  return `${downloadFileText} ${fileName} med størrelse ${size}`;
}

function userSaidSomething(avatarInitials, text) {
  return `Bruker ${avatarInitials} sa, ${text}`;
}

export default {
  FAILED_CONNECTION_NOTIFICATION: 'Kan ikke koble til.',
  INITIAL_CONNECTION_NOTIFICATION: 'Kobler til…',
  INTERRUPTED_CONNECTION_NOTIFICATION: 'Nettverksavbrudd oppstod. Kobler til på nytt…',
  RENDER_ERROR_NOTIFICATION: 'Rederingsfeil. Sjekk utviklerkonsollen eller kontakt botutvikleren.',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `Kunne ikke sende. {Retry}.`,
  SLOW_CONNECTION_NOTIFICATION: 'Det tar lenger tid enn vanlig å koble til.',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  // '[File of type '%1']': '[File of type '%1']",
  // '[Unknown Card '%1']': '[Unknown Card '%1']',
  'Adaptive Card parse error': 'Adaptivt kort parse-feil',
  'Adaptive Card render error': 'Adaptivt kort renderingsfeil',
  BotSent: 'Bot sendte: ',
  Chat: 'Chat',
  'Download file': 'Last ned fil',
  DownloadFileWithFileSize: downloadFileWithFileSize,
  ErrorMessage: 'Feilmelding',
  'Microphone off': 'Mikrofon av',
  'Microphone on': 'Mikrofon på',
  Left: 'Venstre',
  'Listening…': 'Lytter…',
  'New messages': 'Nye meldinger',
  Retry: 'Prøv igjen',
  Right: 'Høyre',
  Send: 'Send',
  Sending: 'Sender',
  SendStatus: 'Send status: ',
  SentAt: 'Sendt: ',
  Speak: 'Snakk',
  'Starting…': 'Starter…',
  Tax: 'Skatt',
  Total: 'Totalt',
  'Type your message': 'Skriv inn melding',
  TypingIndicator: 'Viser skriveindikator',
  'Upload file': 'Last opp fil',
  UserSent: 'Bruker sendte: ',
  VAT: 'MVA'
};
