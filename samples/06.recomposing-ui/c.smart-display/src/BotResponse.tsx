import './BotResponse.css';

import { Components, createAdaptiveCardsAttachmentMiddleware, hooks } from 'botframework-webchat';
import React, { memo, useMemo } from 'react';
import { ReactFilm } from 'react-film';

import useLastBotActivity from './hooks/useLastBotActivity';

const { SpeakActivity } = Components;
const { useSendBoxSpeechInterimsVisible } = hooks;

function BotResponse({ lastReadActivityID }) {
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
        {!!(lastBotActivity as any).text && (
          <div className="App-BotResponse-Activity">{(lastBotActivity as any).text}</div>
        )}
        <ReactFilm className="App-BotResponse-Attachments" showScrollBar={false}>
          {((lastBotActivity as any).attachments || []).map((attachment, index) => (
            <div className="App-BotResponse-Attachment" key={index}>
              {renderAttachment({ activity: lastBotActivity, attachment })}
            </div>
          ))}
        </ReactFilm>
        {lastBotActivity.channelData?.speak && <SpeakActivity activity={lastBotActivity} />}
      </div>
    )
  );
}

export default memo(BotResponse);
