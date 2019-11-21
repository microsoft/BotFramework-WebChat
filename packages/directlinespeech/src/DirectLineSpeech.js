import Observable from 'core-js/features/observable';

import shareObservable from './shareObservable';
import SpeechSynthesisAudioStreamUtterance from './SpeechSynthesisAudioStreamUtterance';

function randomActivityId() {
  return Math.random()
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

        return () => {};
      })
    );

    this.connectionStatus$ = shareObservable(
      new Observable(observer => {
        connectionStatusObserver = observer;

        return () => {};
      })
    );

    dialogServiceConnector.activityReceived = (_, { activity, audioStream }) => {
      // console.groupCollapsed('dialogServiceConnector.activityReceived');
      // console.log(activity, audioStream);
      // console.groupEnd();

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
    // console.groupCollapsed('postActivity');
    // console.log(activity);
    // console.groupEnd();

    try {
      // TODO: [P1] Direct Line Speech server currently do not ack the outgoing activities with any activity ID or timestamp.
      const pseudoActivityId = randomActivityId();
      const isSpeech = !!(activity.channelData && activity.channelData.speech);

      // Do not send the activity if it was from speech
      if (!isSpeech) {
        this.dialogServiceConnector.sendActivityAsync(activity);
      }

      this._activityObserver &&
        this._activityObserver.next({
          ...activity,
          id: pseudoActivityId,
          timestamp: new Date().toISOString()
        });

      this._lastRecognizedEventTimestamp = null;

      return Observable.of(pseudoActivityId);
    } catch (err) {
      return new Observable(observer => observer.error(err));
    }
  }
}

// Interfaces that we did not implemented.
// referenceGrammarId?: string,
// getSessionId? : () => Observable<string>
