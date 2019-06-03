/* eslint no-magic-numbers: ["error", { "ignore": [1, 5, 24, 48, 60000, 3600000] }] */

function xMinutesAgo(date) {
  const now = Date.now();
  const deltaInMs = now - new Date(date).getTime();
  const deltaInMinutes = Math.floor(deltaInMs / 60000);
  const deltaInHours = Math.floor(deltaInMs / 3600000);

  if (deltaInMinutes < 1) {
    return 'Ahora';
  } else if (deltaInMinutes === 1) {
    return 'Hace un minuto';
  } else if (deltaInHours < 1) {
    return `Hace ${deltaInMinutes} minutos`;
  } else if (deltaInHours === 1) {
    return `Hace una hora`;
  } else if (deltaInHours < 5) {
    return `Hace ${deltaInHours} horas`;
  } else if (deltaInHours <= 24) {
    return `Hoy`;
  } else if (deltaInHours <= 48) {
    return `Ayer`;
  }

  return new Intl.DateTimeFormat('es-ES').format(date);
}

export default {
  FAILED_CONNECTION_NOTIFICATION: 'Imposible conectar.',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `No enviado. {Retry}.`,
  SLOW_CONNECTION_NOTIFICATION: 'Está tardando mucho en conectar.',
  'X minutes ago': xMinutesAgo,
  Chat: 'Chat',
  'Microphone off': 'Apagar micrófono',
  'Microphone on': 'Encender micrófono',
  'Download file': 'Descargar archivo',
  'New messages': 'Nuevos mensajes',
  'Listening…': 'Escuchando…',
  Retry: 'Reintentar',
  Send: 'Enviar',
  Sending: 'Enviando',
  Speak: 'Hablar',
  'Starting…': 'Comenzando',
  Tax: 'Impuestos',
  Total: 'Total',
  'Type your message': 'Escribe tu mensaje...',
  'Upload file': 'Subir archivo',
  VAT: 'IVA'
};
