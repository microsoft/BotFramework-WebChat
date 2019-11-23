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
    return '剛剛';
  } else if (deltaInMinutes === 1) {
    return '一分鐘前';
  } else if (deltaInHours < 1) {
    return `${deltaInMinutes} 分鐘前`;
  } else if (deltaInHours === 1) {
    return `一個鐘前`;
  } else if (deltaInHours < 5) {
    return `${deltaInHours} 個鐘前`;
  } else if (deltaInHours <= 24) {
    return `今日`;
  } else if (deltaInHours <= 48) {
    return `昨日`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('zh-HANT').format(date);
  }

  return date.toLocaleString('zh-HANT', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function botSaidSomething(avatarInitials, text) {
  return `Bot ${avatarInitials} 說：${text}`;
}

function downloadFileWithFileSize(downloadFileText, fileName, size) {
  return `${downloadFileText} '${fileName}' 檔案大小 ${size}`;
}

function uploadFileWithFileSize(uploadFileText, fileName, size) {
  return `${uploadFileText} '${fileName}' 檔案大小 ${size}`;
}

function userSaidSomething(avatarInitials, text) {
  return `使用者 ${avatarInitials} 說：${text}`;
}

export default {
  CONNECTED_NOTIFICATION: '已接駁',
  FAILED_CONNECTION_NOTIFICATION: '接駁失敗。',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  INITIAL_CONNECTION_NOTIFICATION: '接駁中...',
  INTERRUPTED_CONNECTION_NOTIFICATION: '網絡暫時中斷，正嘗試再接駁…',
  RENDER_ERROR_NOTIFICATION: 'Render 失敗，請檢查控制台或與 Bot 開發人員聯絡。',
  SEND_FAILED_KEY: `無法發送。{Retry}`,
  SLOW_CONNECTION_NOTIFICATION: '接駁時間比平時長。',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  'Adaptive Card parse error': 'Adaptive Card 解析失敗',
  'Adaptive Card render error': 'Adaptive Card render 失敗',
  BotSent: '機械人已發送: ',
  Chat: '聊天',
  'Download file': '下載檔案',
  ConnectivityStatus: '接駁狀態: ',
  DownloadFileWithFileSize: downloadFileWithFileSize,
  ErrorMessage: '錯誤信息',
  'Microphone off': '關掉麥克風',
  'Microphone on': '開啟麥克風',
  Left: '左',
  'Listening…': '正在聆聽…',
  'New messages': '新訊息',
  Retry: '重試',
  Right: '右',
  Send: '發送',
  SendBox: '對話框',
  Sending: '正在發送',
  SendStatus: '發送狀態: ',
  SentAt: '發送的時間: ',
  Speak: '發言',
  SuggestedActionsContainer: '建議按鈕: ',
  SuggestedActionsContent: '有内容',
  SuggestedActionsEmpty: '空白',
  'Starting…': '開始中…',
  Tax: '稅',
  Total: '總共',
  'Type your message': '請輸入您的訊息',
  'Upload file': '上載檔案',
  UploadFileWithFileSize: uploadFileWithFileSize,
  UserSent: '用戶已發送: ',
  VAT: '消費稅'
};
