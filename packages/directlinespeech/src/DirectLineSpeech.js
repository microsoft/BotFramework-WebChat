/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2, 4, 36] }] */

import Observable from 'core-js/features/observable';
import random from 'math-random';

import shareObservable from './shareObservable';
import SpeechSynthesisAudioStreamUtterance from './SpeechSynthesisAudioStreamUtterance';

function randomActivityId() {
  return random().toString(36).substr(2);
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

        dialogServiceConnector.connect(
          () => {
            connectionStatusObserver.next(2);
          },
          error => {
            connectionStatusObserver.next(4);

            console.warn('botframework-directlinespeech-sdk: Failed to connect', { error });
          }
        );
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
              speechSynthesisUtterance: new SpeechSynthesisAudioStreamUtterance(audioStream)
            },
            from: {
              ...activity.from,
              // Since DLSpeech service never ACK our outgoing activity, this activity must be from bot.
              role: 'bot'
            },
            // Since DLSpeech never ACK our outgoing activity, the "replyToId" will rarely able to point to an existing activity.
            replyToId: undefined,
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
    try {
      this.dialogServiceConnector.close();
    } catch (err) {
      if (!~err.message.indexOf('already disposed')) {
        throw err;
      }
    }
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
      const isSpeech = !!activity.channelData?.speech;

      // Do not send the activity if it was from speech.
      if (!isSpeech) {
        // Starting from Speech SDK 1.13.0, they accept JSON text instead of JavaScript object.
        // https://github.com/microsoft/cognitive-services-speech-sdk-js/commit/2f3a35446692b6d492a6c68e3237a48de67e293f
        this.dialogServiceConnector.sendActivityAsync(JSON.stringify(activity));
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
