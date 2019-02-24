function xMinutesAgo(date) {
  const now = Date.now();
  const deltaInMs = now - new Date(date).getTime();
  const deltaInMinutes = Math.floor(deltaInMs / 60000);
  const deltaInHours = Math.floor(deltaInMs / 3600000);

  if (deltaInMinutes < 1) {
    return 'עכשיו';
  } else if (deltaInMinutes === 1) {
    return 'לפני דקה';
  } else if (deltaInHours < 1) {
    return ` לפני ${ deltaInMinutes } דקות `;
  } else if (deltaInHours === 1) {
    return `לפני שעה`;
  } else if (deltaInHours < 5) {
    return ` לפני ${ deltaInHours } שעות `;
  } else if (deltaInHours <= 24) {
    return `היום`;
  } else if (deltaInHours <= 48) {
    return `אתמול`;
  } else {
    return new Intl.DateTimeFormat('he-IL', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    }).format(new Date(date));
  }
}

export default {
  'X minutes ago': xMinutesAgo,
  // '[File of type '%1']",
  // '[Unknown Card '%1']',
  'Adaptive Card parse error': 'Adaptive Card parse error',
  'Adaptive Card render error': 'Adaptive Card render error',
  'Chat': 'צ\'אט',
  'Left': 'שמאל',
  'Listening…': 'מאזין…',
  'New messages': 'הודעות חדשות',
  'retry': 'נסה שנית',
  'Right': 'ימין',
  // Do not localize {retry}, it is a placeholder for "retry"
  'Send failed, {retry}': 'שליחה נכשלה, {retry}',
  'Send': 'שלח',
  'Sending': 'שולח',
  'Speak': 'דבר',
  'Starting…': 'מתחיל…',
  'Tax': 'מס',
  'Total': 'סה"כ',
  'Type your message': 'הכנס הודעה',
  'Upload file': 'העלה קובץ',
  'VAT': 'מע"מ'
}
