function xMinutesAgo(date) {
  const now = Date.now();
  const deltaInMs = now - new Date(date).getTime();
  const deltaInMinutes = Math.floor(deltaInMs / 60000);
  const deltaInHours = Math.floor(deltaInMs / 3600000);

  if (deltaInMinutes < 1) {
    return '啱啱';
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
    // https://zh-yue.wikipedia.org/wiki/尋日
    return `尋日`;
  } else {
    return new Intl.DateTimeFormat('zh-HK').format(date);
  }
}

export default {
  'Chat': '傾偈',
  // 'Download file': '',
  'Microphone off': '閂咪',
  'Microphone on': '開咪',
  'Left': '左',
  'Listening…': '聽緊你講嘢…',
  'New messages': '新訊息',
  'retry': '再嚟一次',
  'Right': '右',
  'Send failed, {retry}': '傳送唔倒，{retry}',
  'Sending': '而家傳送緊',
  'Starting…': '開始緊…',
  'Tax': '稅',
  'Total': '總共',
  'VAT': '消費稅',
  'Send': '傳送',
  'Speak': '講嘢',
  'Upload file': '上載檔案',
  'Type your message': '請打你嘅訊息',
  'X minutes ago': xMinutesAgo
}
