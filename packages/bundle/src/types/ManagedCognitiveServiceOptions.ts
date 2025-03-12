type DirectlineAuthorizationToken = {
  directlineToken: string;
};

type ManagedCognitiveServicesHostname = {
  hostname: string;
};

type ManagedCognitiveServiceBaseOptions = DirectlineAuthorizationToken & ManagedCognitiveServicesHostname;

type ManagedCognitiveServiceOptions =
  | ManagedCognitiveServiceBaseOptions
  | Promise<ManagedCognitiveServiceBaseOptions>
  | (() => ManagedCognitiveServiceBaseOptions)
  | (() => Promise<ManagedCognitiveServiceBaseOptions>);

export default ManagedCognitiveServiceOptions;
