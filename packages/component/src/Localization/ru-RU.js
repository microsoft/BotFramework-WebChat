/* eslint no-magic-numbers: ["error", { "ignore": [1, 5, 24, 48, 72, 60000, 3600000] }] */

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
    return 'Сейчас';
  } else if (deltaInMinutes === 1) {
    return 'Минуту назад';
  } else if (deltaInHours < 1 && deltaInMinutes < 5) {
    return `${deltaInMinutes} минуты назад`;
  } else if (deltaInHours < 1 && deltaInMinutes >= 5) {
    return `${deltaInMinutes} минут назад`;
  } else if (deltaInHours === 1) {
    return 'Час назад';
  } else if (deltaInHours < 5) {
    return `${deltaInHours} часа назад`;
  } else if (deltaInHours <= 24) {
    return 'Сегодня';
  } else if (deltaInHours <= 48) {
    return 'Вчера';
  } else if (deltaInHours <= 72) {
    return 'Позавчера';
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('ru-RU').format(date);
  }

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export default {
  FAILED_CONNECTION_NOTIFICATION: 'Ошибка подключения.',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `Не удалось отправить, {Retry}.`,
  SLOW_CONNECTION_NOTIFICATION: 'Требуется больше времени, чем обычно.',
  'Adaptive Card parse error': 'Ошибка парсинга адаптивной карты',
  'Adaptive Card render error': 'Ошибка отображения адаптивной карты',
  Chat: 'Чат',
  'Download file': 'Скачать файл',
  'Microphone off': 'Микрофон влючен',
  'Microphone on': 'Микрофон выключен',
  'Listening…': 'Прослушивание…',
  Retry: 'повторить',
  Send: 'Отправить',
  Sending: 'Отправка',
  Speak: 'Говорить',
  'Starting…': 'Запуск…',
  Tax: 'Налог',
  Total: 'Итого',
  'Type your message': 'Введите ваше сообщение',
  'Upload file': 'Загрузить файл',
  VAT: 'НДС',
  'New messages': 'Новые сообщения',
  'X minutes ago': xMinutesAgo
};
