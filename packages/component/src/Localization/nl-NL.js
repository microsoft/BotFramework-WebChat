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
    return 'Zojuist';
  } else if (deltaInMinutes === 1) {
    return 'Een minuut geleden';
  } else if (deltaInHours < 1) {
    return `${deltaInMinutes} minuten geleden`;
  } else if (deltaInHours === 1) {
    return `Een uur geleden`;
  } else if (deltaInHours < 5) {
    return `${deltaInHours} uur geleden`;
  } else if (deltaInHours <= 24) {
    return `Vandaag`;
  } else if (deltaInHours <= 48) {
    return `Gisteren`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('nl-NL').format(date);
  }

  return date.toLocaleString('nl-NL', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function botSaidSomething(avatarInitials, text) {
  return `Bot ${avatarInitials} zei; ${text}`;
}

function userSaidSomething(avatarInitials, text) {
  return `Gebruiker ${avatarInitials} zei; ${text}`;
}

export default {
  FAILED_CONNECTION_NOTIFICATION: 'Verbinding maken niet mogelijk.',
  SEND_FAILED_KEY: 'Versturen mislukt, {Retry}.',
  SLOW_CONNECTION_NOTIFICATION: 'Verbinding maken duurt langer dan normaal…',
  'Bot said something': botSaidSomething,
  Chat: 'Chat',
  'Download file': 'Bestand downloaden',
  'Listening…': 'Aan het luisteren…',
  'Microphone off': 'Microfoon uit',
  'Microphone on': 'Microfoon aan',
  Retry: 'probeer opnieuw',
  Send: 'Verstuur',
  Sending: 'versturen',
  Speak: 'Spreek',
  'Starting…': 'Starten…',
  Tax: 'BTW',
  Total: 'Totaal',
  'Type your message': 'Typ je bericht',
  'Upload file': 'Bestand uploaden',
  'User said something': userSaidSomething,
  VAT: 'VAT',
  'X minutes ago': xMinutesAgo
};
