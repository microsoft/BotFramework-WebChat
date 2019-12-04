/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2, 36] }] */

import Observable from 'core-js/features/observable';
import random from 'math-random';

import shareObservable from './shareObservable';
import SpeechSynthesisAudioStreamUtterance from './SpeechSynthesisAudioStreamUtterance';

function randomActivityId() {
  return random()
    .toString(36)
    .substr(2);
}

export default class DirectLineSpeech {
  constructor({ dialogServiceConnector }) {
    let connectionStatusObserver;

    this.dialogServiceConnector = dialogServiceConnector;

    this.activity$ = shareObservable(
      new Observable(observer => {
        this._activityObserver = observer;

        connectionStatusObserver.next(0);
        connectionStatusObserver.next(1);
        connectionStatusObserver.next(2);
      })
    );

    this.connectionStatus$ = shareObservable(
      new Observable(observer => {
        connectionStatusObserver = observer;
      })
    );

    dialogServiceConnector.activityReceived = (_, { activity, audioStream }) => {
      try {
        this._activityObserver &&
          this._activityObserver.next({
            ...activity,
            channelData: {
              ...activity.channelData,
              ...(audioStream ? { speechSynthesisUtterance: new SpeechSynthesisAudioStreamUtterance(audioStream) } : {})
            },
            from: {
              ...activity.from,
              // Since DLSpeech service never ACK our outgoing activity, this activity must be from bot.
              role: 'bot'
            },
            // Direct Line Speech server currently do not timestamp outgoing activities.
            // Thus, it will be easier to just re-timestamp every incoming/outgoing activities using local time.
            timestamp: new Date().toISOString()
          });
      } catch (error) {
        console.error(error);
      }
    };
  }

  end() {
    this.dialogServiceConnector.close();
  }

  postActivity(activity) {
    // Currently, Web Chat set user ID on all outgoing activities.
    // As Direct Line Speech maintains its own user ID, Web Chat should not set the user ID.
    // TODO: [P2] We should move user ID into options of DirectLineJS, instead of Web Chat.
    activity = {
      ...activity,
      from: { role: 'user' }
    };

    try {
      // TODO: [P1] Direct Line Speech server currently do not ack the outgoing activities with any activity ID or timestamp.
      const pseudoActivityId = randomActivityId();
      const isSpeech = !!(activity.channelData && activity.channelData.speech);

      // Do not send the activity if it was from speech.
      if (!isSpeech) {
        this.dialogServiceConnector.sendActivityAsync(activity);
      }

      this._activityObserver &&
        this._activityObserver.next({
          ...activity,
          id: pseudoActivityId,
          timestamp: new Date().toISOString()
        });

      return Observable.of(pseudoActivityId);
    } catch (err) {
      return new Observable(observer => observer.error(err));
    }
  }
}

// Interfaces not yet implemented in Web Chat:
// referenceGrammarId?: string,
// getSessionId? : () => Observable<string>
