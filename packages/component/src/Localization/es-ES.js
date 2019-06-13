/* eslint no-magic-numbers: ["error", {"ignore": [1, 5, 24, 48, 60000, 3600000] }] */

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
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('es-ES').format(date);
  }

  return date.toLocaleString('es-ES', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function botSaidSomething(avatarInitials, text) {
  return `El Bot ${avatarInitials} dijo, ${text}`;
}

function userSaidSomething(avatarInitials, text) {
  return `El usuario ${avatarInitials} dijo, ${text}`;
}

export default {
  FAILED_CONNECTION_NOTIFICATION: 'Imposible conectar.',
  INITIAL_CONNECTION_NOTIFICATION: 'Conexión iniciada',
  INTERRUPTED_CONNECTION_NOTIFICATION: 'Conexión interrumpida…',
  RENDER_ERROR_NOTIFICATION: 'Error de visualización',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `No enviado. {Retry}.`,
  SLOW_CONNECTION_NOTIFICATION: 'Tomando más de lo usual para conectarse.',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  'Adaptive Card parse error': 'Error interpretando la Tarjeta Adaptable',
  'Adaptive Card render error': 'Error desplegando la Tarjeta Adaptable',
  Chat: 'Chat',
  'Download file': 'Descargar archivo',
  'Microphone off': 'Apagar micrófono',
  'Microphone on': 'Encender micrófono',
  'New messages': 'Nuevos mensajes',
  Left: 'Izquierda',
  'Listening…': 'Escuchando…',
  Retry: 'Reintentar',
  Right: 'Derecha',
  Send: 'Enviar',
  Sending: 'Enviando',
  Speak: 'Hablar',
  'Starting…': 'Comenzando…',
  Tax: 'Impuesto',
  Total: 'Total',
  'Type your message': 'Escribe tu mensaje…',
  'Upload file': 'Subir archivo',
  VAT: 'IVA'
};
