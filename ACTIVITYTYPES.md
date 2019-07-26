## What Activity Types does Web Chat support?

First, see the [Activities overview](https://docs.microsoft.com/en-us/azure/bot-service/dotnet/bot-builder-dotnet-activities?view=azure-bot-service-3.0) documentation to learn about what activities types are available in Bot Framework.

This document will discuss what Bot Framework Activity Types that Web Chat is prepared to handle *as a client*. To see documentation on which activity types are supported by server-side Channels, please see the [Activities by Channel](https://github.com/microsoft/botframework-sdk/issues/5294) documentation. 

Although the Direct Line Channel (Web Chat's Bot Framework Channel) supports the following activity types, Web Chat is only designed to support the following activities:

| Server :left_right_arrow: Bot Activity only 	| Direct Line Channel supported Activity 	| Web Chat supported Activity 	|
|---------------------------------------------	|----------------------------------------	|-----------------------------	|
|                                        	      | `Message`                              	| :heavy_check_mark:          	|
| :heavy_check_mark:                           	| `ConversationUpdate`                   	|                             	|
|                                        	      | `Event`                                	| :heavy_check_mark:          	|
| :heavy_check_mark:                     	      | `Event.TokenResponse`                  	|                             	|
|                                        	      | `EndOfConversation`                    	|                             	|
|                                        	      | `Typing`                               	| :heavy_check_mark:          	|
| :heavy_check_mark:                     	      | `InstallationUpdate`                  	|                             	|


- `InstallationUpdate`, `Event.TokenResponse` and `ConversationUpdate`are activities sent between the bot and the server. Web Chat the client is not designed to render these activities by default.
- `EndOfConversation` is not currently rendered by Web Chat. See the Web Chat conversation on [Activity Types](https://github.com/microsoft/BotFramework-WebChat/issues/1808) to learn more.

When developing your bot's web page, you may discover that the bot sends an activity type that needs to be supported by Web Chat. Luckily, it is possible to create renderers for different activities through the [`activityMiddleware`](https://github.com/microsoft/BotFramework-WebChat#web-chat-api-reference). To learn more, check out the following tutorials:

1. [Customize Web Chat with Reaction Buttons](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/09.customization-reaction-buttons/)
1. [Customize Web Chat with GitHub Stargazer Components](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/10.a.customization-card-components)
