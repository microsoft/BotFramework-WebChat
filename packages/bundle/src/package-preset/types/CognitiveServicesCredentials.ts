type CognitiveServicesAuthorizationToken = {
  authorizationToken: string;
};

type CognitiveServicesSubscriptionKey = {
  subscriptionKey: string;
};

type CognitiveServicesRegion = {
  region: string;
};

type CognitiveServicesSovereignCloud = {
  customVoiceHostname: string;
  speechRecognitionHostname: string;
  speechSynthesisHostname: string;
};

type CognitiveServicesBaseCredentials = (CognitiveServicesAuthorizationToken | CognitiveServicesSubscriptionKey) &
  (CognitiveServicesRegion | CognitiveServicesSovereignCloud);

type CognitiveServicesCredentials =
  | CognitiveServicesBaseCredentials
  | Promise<CognitiveServicesBaseCredentials>
  | (() => CognitiveServicesBaseCredentials)
  | (() => Promise<CognitiveServicesBaseCredentials>);

export default CognitiveServicesCredentials;
