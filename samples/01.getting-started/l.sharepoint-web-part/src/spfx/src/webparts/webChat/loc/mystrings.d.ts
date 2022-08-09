declare interface IWebChatWebPartStrings {
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  DomainFieldLabel: string;
  PropertyPaneDescription: string;
  TokenFieldLabel: string;
}

declare module 'WebChatWebPartStrings' {
  const strings: IWebChatWebPartStrings;
  export = strings;
}
