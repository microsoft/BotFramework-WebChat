function xMinutesAgo(date) {
  const now = Date.now();
  const deltaInMs = now - new Date(date).getTime();
  const deltaInMinutes = Math.floor(deltaInMs / 60000);
  const deltaInHours = Math.floor(deltaInMs / 3600000);

  if (deltaInMinutes < 1) {
    return 'たった今';
  } else if (deltaInHours < 1) {
    return `${ deltaInMinutes } 分前`;
  } else if (deltaInHours < 5) {
    return `${ deltaInHours } 時間前`;
  } else if (deltaInHours <= 24) {
    return '今日';
  } else if (deltaInHours <= 48) {
    return '昨日';
  } else {
    return new Intl.DateTimeFormat('ja-JP').format(date);
  }
}

export default {
  'Chat': 'チャット',
  'Download file': 'ダウンロード',
  'Microphone off': 'マイクオン',
  'Microphone on': 'マイクオフ',
  'Listening': '聴いてます',
  'retry': '再送',
  'Send failed, {retry}': '送信できませんでした。{retry}',
  'Sending': '送信中',
  'Tax': '税',
  'Type your message': 'メッセージを入力してください',
  'Total': '合計',
  'VAT': '消費税',
  'Send': '送信',
  'X minutes ago': xMinutesAgo
}
