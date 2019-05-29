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
    return 'Agora mesmo';
  } else if (deltaInMinutes === 1) {
    return 'Um minuto atrás';
  } else if (deltaInHours < 1) {
    return `${deltaInMinutes} minutos atrás`;
  } else if (deltaInHours === 1) {
    return `Uma hora atrás`;
  } else if (deltaInHours < 5) {
    return `${deltaInHours} horas atrás`;
  } else if (deltaInHours <= 24) {
    return `Hoje`;
  } else if (deltaInHours <= 48) {
    return `Ontem`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('pt-PT').format(date);
  }

  return date.toLocaleString('pt-PT', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export default {
  // FAILED_CONNECTION_NOTIFICATION: '',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `não foi possível enviar, {Retry}.`,
  SLOW_CONNECTION_NOTIFICATION: 'A ligação está a demorar mais tempo que o normal.',
  Chat: 'Chat',
  'Download file': 'Download ficheiro',
  'Microphone off': 'Microfone desligado',
  'Microphone on': 'Microfone ligado',
  'Listening…': 'A Escutar…',
  Retry: 'repetir',
  Send: 'Enviar',
  Sending: 'a enviar',
  Speak: 'Falar',
  'Starting…': 'A iniciar…',
  Tax: 'Imposto',
  Total: 'Total',
  'Type your message': 'Escreva a sua mensagem',
  'Upload file': 'Upload de ficheiro',
  VAT: 'IVA',
  'X minutes ago': xMinutesAgo
};
