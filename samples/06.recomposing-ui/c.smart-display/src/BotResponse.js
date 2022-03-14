import './BotResponse.css';

import { Components, createAdaptiveCardsAttachmentMiddleware, hooks } from 'botframework-webchat';
import Film from 'react-film';
import React, { useMemo } from 'react';

import useLastBotActivity from './hooks/useLastBotActivity';

const { SpeakActivity } = Components;
const { useSendBoxSpeechInterimsVisible } = hooks;

const BotResponse = ({ lastReadActivityID }) => {
  const [interimsVisible] = useSendBoxSpeechInterimsVisible();
  const [lastBotActivity] = useLastBotActivity();

  const renderAttachment = useMemo(() => {
    return createAdaptiveCardsAttachmentMiddleware()()(() => false);
  }, []);

  return (
    !interimsVisible &&
    !!lastBotActivity &&
    lastBotActivity.id !== lastReadActivityID && (
      <div className="App-BotResponse">
        {!!lastBotActivity.text && <div className="App-BotResponse-Activity">{lastBotActivity.text}</div>}
        <Film className="App-BotResponse-Attachments" showScrollBar={false}>
          {(lastBotActivity.attachments || []).map((attachment, index) => (
            <div className="App-BotResponse-Attachment" key={index}>
              {renderAttachment({ activity: lastBotActivity, attachment })}
            </div>
          ))}
        </Film>
        {lastBotActivity.channelData?.speak && <SpeakActivity activity={lastBotActivity} />}
      </div>
    )
  );
};

export default BotResponse;
