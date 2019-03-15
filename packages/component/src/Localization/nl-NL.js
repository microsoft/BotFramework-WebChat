function botSaidSomething(avatarInitials, text, timestamp) {
  return `Bot ${avatarInitials} zei; ${text}, ${xMinutesAgo(timestamp)}`;
}

function userSaidSomething(avatarInitials, text, timestamp) {
  return `Gebruiker ${avatarInitials} zei; ${text}, ${xMinutesAgo(timestamp)}`;
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
  } else {
    return date.toLocaleString('nl-NL', {
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
  FAILED_CONNECTION_NOTIFICATION: 'Verbinding maken niet mogelijk.',
  SEND_FAILED_KEY: 'Versturen mislukt, {retry}.',
  SLOW_CONNECTION_NOTIFICATION: 'Verbinding maken duurt langer dan normaal…',
  'Chat': 'Chat',
  'Download file': 'Bestand downloaden',
  'Microphone off': 'Microfoon uit',
  'Microphone on': 'Microfoon aan',
  'Listening…': 'Aan het luisteren…',
  'retry': 'probeer opnieuw',
  'Retry': 'Opnieuw proberen', 
  'Send': 'Verstuur',
  'Sending': 'versturen',
  'Speak': 'Spreek',
  'Starting…': 'Starten…',
  'Tax': 'BTW',
  'Total': 'Totaal',
  'Type your message': 'Typ je bericht',
  'Upload file': 'Bestand uploaden',
  'VAT': 'VAT',
  'X minutes ago': xMinutesAgo
}
