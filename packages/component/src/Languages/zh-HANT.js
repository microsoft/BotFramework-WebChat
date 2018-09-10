function xMinutesAgo(date) {
  const now = Date.now();
  const deltaInMs = now - new Date(date).getTime();
  const deltaInMinutes = Math.floor(deltaInMs / 60000);
  const deltaInHours = Math.floor(deltaInMs / 3600000);

  if (deltaInMinutes < 1) {
    return '剛剛';
  } else if (deltaInMinutes === 1) {
    return '一分鐘前';
  } else if (deltaInHours < 1) {
    return `${ deltaInMinutes } 分鐘前`;
  } else if (deltaInHours === 1) {
    return `一個鐘前`;
  } else if (deltaInHours < 5) {
    return `${ deltaInHours } 個鐘前`;
  } else if (deltaInHours <= 24) {
    return `今日`;
  } else if (deltaInHours <= 48) {
    return `昨日`;
  } else {
    return new Intl.DateTimeFormat('zh-HK').format(date);
  }
}

export default {
  'Chat': '聊天',
  'Listening': '正在聆聽',
  'retry': '重試',
  'Send failed, [retry]': '無法發送，[retry]',
  'Sending': '正在發送',
  'Tax': '稅',
  'Type your message': '請輸入您的訊息',
  'Total': '總共',
  'VAT': '消費稅',
  'Send': '發送',
  'Speak': '發言',
  'Upload file': '上載檔案',
  'X minutes ago': xMinutesAgo
}
