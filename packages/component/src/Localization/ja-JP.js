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
    return 'たった今';
  } else if (deltaInHours < 1) {
    return `${deltaInMinutes} 分前`;
  } else if (deltaInHours < 5) {
    return `${deltaInHours} 時間前`;
  } else if (deltaInHours <= 24) {
    return '今日';
  } else if (deltaInHours <= 48) {
    return '昨日';
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('ja-JP').format(date);
  }

  return date.toLocaleString('ja-JP', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function botSaidSomething(avatarInitials, text) {
  return `ボット${avatarInitials}は${text}と言いました`;
}

function userSaidSomething(avatarInitials, text) {
  return `ユーザー ${avatarInitials}は${text}と言いました`;
}

export default {
  FAILED_CONNECTION_NOTIFICATION: '接続できませんでした。',
  INITIAL_CONNECTION_NOTIFICATION: '接続中...',
  INTERRUPTED_CONNECTION_NOTIFICATION: 'ネットワーク中断しました。 再接続中...',
  RENDER_ERROR_NOTIFICATION:
    'レンダリングエラーが発生しました。コンソールを確認するか、ボットの開発者に連絡してください。',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `送信できませんでした。{Retry}。`,
  SLOW_CONNECTION_NOTIFICATION: '接続するのにはいつもより長くかかります。',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  'Adaptive Card parse error': 'Adaptive Cardの解析エラー',
  'Adaptive Card render error': 'Adaptive Cardのレンダリングエラー',
  Chat: 'チャット',
  'Download file': 'ダウンロード',
  'Microphone off': 'マイクオン',
  'Microphone on': 'マイクオフ',
  Left: '左',
  Listening: '聴いてます…',
  Retry: '再送',
  Right: '右',
  Send: '送信',
  SendBox: 'テキストボックス',
  Sending: '送信中',
  Speak: '話してください',
  'Starting…': 'スタート…',
  Tax: '税',
  Total: '合計',
  'Type your message': 'メッセージを入力してください',
  'Upload file': 'ファイルをアップロード',
  VAT: '消費税'
};
