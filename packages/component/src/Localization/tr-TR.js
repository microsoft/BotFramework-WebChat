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
    return 'Şimdi';
  } else if (deltaInMinutes === 1) {
    return 'Bir dakika önce';
  } else if (deltaInHours < 1) {
    return `${deltaInMinutes} dakika önce`;
  } else if (deltaInHours === 1) {
    return `Bir saat önce`;
  } else if (deltaInHours < 5) {
    return `${deltaInHours} saat önce`;
  } else if (deltaInHours <= 24) {
    return `Bugün`;
  } else if (deltaInHours <= 48) {
    return `Dün`;
  } else if (window.Intl) {
    return new Intl.DateTimeFormat('tr-TR').format(date);
  }

  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export default {
  FAILED_CONNECTION_NOTIFICATION: 'Bağlanamadı.',
  INITIAL_CONNECTION_NOTIFICATION: 'Bağlanıyor…',
  INTERRUPTED_CONNECTION_NOTIFICATION: 'Ağ kesintisi meydana geldi. Yeniden bağlanıyor...',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `gönderilemedi, {Retry}.`,
  SLOW_CONNECTION_NOTIFICATION: 'Bağlantı hızı çok düşük.',
  Chat: 'Sohbet',
  'Download file': 'Dosyayı indir',
  'Microphone off': 'Mikrofon kapalı',
  'Microphone on': 'Mikrofon açık',
  'X minutes ago': xMinutesAgo,
  'Listening…': 'Dinliyor…',
  Retry: 'yeniden deneyin',
  Send: 'Gönder',
  Sending: 'gönderiliyor',
  // 'Speak': '',
  'Starting…': 'Başlıyor…',
  Tax: 'Vergi',
  Total: 'Toplam',
  'Type your message': 'İletinizi yazın',
  // 'Upload file': '',
  VAT: 'KDV'
};
