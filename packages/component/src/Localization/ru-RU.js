function xMinutesAgo(date) {
  const now = Date.now();
  const deltaInMs = now - new Date(date).getTime();
  const deltaInMinutes = Math.floor(deltaInMs / 60000);
  const deltaInHours = Math.floor(deltaInMs / 3600000);

  if (deltaInMinutes < 1) {
    return 'Сейчас';
  } else if (deltaInMinutes === 1) {
    return 'Минуту назад';
  } else if (deltaInHours < 1 && deltaInMinutes < 5) {
    return `${ deltaInMinutes } минуты назад`;
  } else if (deltaInHours < 1 && deltaInMinutes >= 5) {
    return `${ deltaInMinutes } минут назад`;
  } else if (deltaInHours === 1) {
    return `Час назад`;
  } else if (deltaInHours < 5) {
    return `${ deltaInHours } часа назад`;
  } else if (deltaInHours <= 24) {
    return `Сегодня`;
  } else if (deltaInHours <= 48) {
    return `Вчера`;
  } else if (deltaInHours <= 72) {
    return `Позавчера`;
  } else {
    return new Intl.DateTimeFormat('ru-RU').format(date);
  }
}

export default {
  'Chat': 'Чат',
  'Listening…': 'прослушивание…',
  'retry': 'повторить',
  'Send failed, {retry}': 'не удалось отправить, {retry}',
  'Send': 'Отправить',
  'Sending': 'Отправка',
  // 'Speak': '',
  'Starting…': 'Запуск...',
  'Tax': 'Налог',
  'Total': 'Итого',
  'Type your message': 'Введите ваше сообщение',
  'Upload file': 'Загрузить файл',
  'VAT': 'НДС',
  'X minutes ago': xMinutesAgo
}
