/* eslint no-magic-numbers: ["error", { "ignore": [1, 5, 24, 48, 60000, 3600000] }] */

import getLocaleString from './getLocaleString';

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
    return 'الآن';
  } else if (deltaInMinutes === 1) {
    return 'قبل دقيقة';
  } else if (deltaInHours < 1) {
    return `قبل ${deltaInMinutes} دقائق`;
  } else if (deltaInHours === 1) {
    return `An hour ago`; // This was not filled by original contributor. Please file a PR with the ar-JO fix if you are a speaker.
  } else if (deltaInHours < 5) {
    return `قبل ${deltaInHours} ساعات`;
  } else if (deltaInHours <= 24) {
    return `اليوم`;
  } else if (deltaInHours <= 48) {
    return `الأمس`;
  }
  return getLocaleString(date, 'ar-JO');
}

function botSaidSomething(avatarInitials, text) {
  return `رد الآلي ${avatarInitials} قال, ${text}`;
}

function downloadFileWithFileSize(downloadFileText, fileName, size) {
  // Full text should read: "Download file <filename> of size <filesize>"
  return `${downloadFileText} ${fileName} بحجم ${size}`;
}

function uploadFileWithFileSize(fileName, size) {
  return `${fileName} بحجم ${size}`;
}

function userSaidSomething(avatarInitials, text) {
  return `المستخدم ${avatarInitials} قال, ${text}`;
}

export default {
  CONNECTED_NOTIFICATION: 'تم الإتصال',
  FAILED_CONNECTION_NOTIFICATION: 'غير قادر عالإتصال.',
  INITIAL_CONNECTION_NOTIFICATION: 'يتم الاتصال…',
  INTERRUPTED_CONNECTION_NOTIFICATION: 'حدث انقطاع في الشبكة. إعادة الاتصال…',
  RENDER_ERROR_NOTIFICATION: 'خطأ تقديم. يرجى التحقق من وحدة التحكم أو الاتصال مطور الروبوت.',
  // Do not localize {Retry}; it is a placeholder for "Retry". English translation should be, "Send failed. Retry."
  SEND_FAILED_KEY: `فشل في الارسال. {إعادة المحوالة}.`,
  SLOW_CONNECTION_NOTIFICATION: 'الإتصال يستغرق اكثر من المعتاد.',
  'Bot said something': botSaidSomething,
  'User said something': userSaidSomething,
  'X minutes ago': xMinutesAgo,
  // '[File of type '%1']': '[File of type '%1']",
  // '[Unknown Card '%1']': '[Unknown Card '%1']',
  'Adaptive Card parse error': 'غير قادر على تفصيل بطاقة التكيف',
  'Adaptive Card render error': 'غير قادر على عرض بطاقة التكيف',
  BotSent: 'الرد الآلي أرسل: ',
  Chat: 'دردش',
  'Download file': 'تحميل الملف',
  DownloadFileWithFileSize: downloadFileWithFileSize,
  ErrorMessage: 'رسالة المشكلة',
  'Microphone off': 'المايكروفون مغلق',
  'Microphone on': 'المايكروفون يعمل',
  Left: 'يسار',
  'Listening…': 'جاري الإستماع…',
  'New messages': 'رسائل جديدة',
  Retry: 'إعادة المحاولة',
  Right: 'يمين',
  Send: 'إرسال',
  SendBox: 'صندوق الإرسال',
  Sending: 'جاري الإرسال',
  SendStatus: 'حالة الإرسال: ',
  SentAt: 'أرسل ب: ',
  Speak: 'تكلم',
  'Starting…': 'جاري البدء…',
  Tax: 'ضريبة',
  Total: 'المجموع',
  'Type your message': 'اكتب رسالتك',
  TypingIndicator: 'يتم عرض مؤشر الكتابة',
  'Upload file': 'رفع الملف',
  UploadFileWithFileSize: uploadFileWithFileSize,
  UserSent: 'المستخدم أرسل: ',
  VAT: 'VAT'
};
