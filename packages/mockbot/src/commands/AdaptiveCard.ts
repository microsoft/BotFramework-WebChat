import { TurnContext } from 'botbuilder';

import BingSports from './Cards/BingSports';
import CalendarReminder from './Cards/CalendarReminder';
import FlightUpdate from './Cards/FlightUpdate';
import Inputs from './Cards/Inputs';
import Simple from './Cards/Simple';
import Weather from './Cards/Weather';

function getCardJSON(name: string = '') {
  switch (name.toLowerCase()) {
    case 'bingsports':
    case 'sports':
      return BingSports();

    case 'calendarreminder':
    case 'calendar':
    case 'reminder':
      return CalendarReminder();

    case 'flight':
    case 'flightupdate':
      return FlightUpdate();

    case 'inputs':
      return Inputs();

    case 'simple':
      return Simple();

    case 'weather':
      return Weather();
  }
}

export default async function (context: TurnContext, name: string = '') {
  const content = getCardJSON(name);

  if (content) {
    await context.sendActivity({
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content
      }]
    });
  } else {
    await context.sendActivity({
      type: 'message',
      text: `No card named "${ name }"`
    });
  }
}
