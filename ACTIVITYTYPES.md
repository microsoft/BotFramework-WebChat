## What Activity Types does Web Chat support?

First, see the [Activities overview](https://docs.microsoft.com/en-us/azure/bot-service/dotnet/bot-builder-dotnet-activities?view=azure-bot-service-3.0) documentation to learn about what activities types are available in Bot Framework.

This document will discuss what Bot Framework activity types that Web Chat is prepared to handle *as a client*. To see documentation on which activity types are supported by different channels, please see the [Activities by Channel](https://github.com/microsoft/botframework-sdk/issues/5294) discussion. 

Although the Direct Line channel and Web Chat channel support the following activity types, Web Chat is only designed to support the following activities:

| Direct Line Channel supported Activity  | Channel :left_right_arrow: Bot Activity  | `Activity.type`     |
|---------------------------------------- |----------------------------------------  |-------------------  |
| `message`                               |                                          | :heavy_check_mark:  |
| `conversationUpdate`                    | :heavy_check_mark:                       |                     |
| `event`                                 |                                          | :heavy_check_mark:  |
| `event.TokenResponse`                   | :heavy_check_mark:                       |                     |
| `endOfConversation`                     |                                          |                     |
| `typing`                                |                                          | :heavy_check_mark:  |
| `installationUpdate`                    | :heavy_check_mark:                       |                     |

- `installationUpdate`, `event.TokenResponse` and `conversationUpdate` are activities sent between the bot and the channel. The channel does not send these events to Web Chat.
- `endOfConversation` is not currently handled or rendered by Web Chat. See the Web Chat conversation on [Activity Types](https://github.com/microsoft/BotFramework-WebChat/issues/1808) to learn more.

When developing your bot's web page, you may discover that the bot sends an activity type that needs to be supported by Web Chat. Luckily, it is possible to create renderers for different activities through the [`activityMiddleware`](https://github.com/microsoft/BotFramework-WebChat#web-chat-api-reference). To learn more, check out the following tutorials:

1. [Customize Web Chat with Reaction Buttons](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/09.customization-reaction-buttons/)
1. [Customize Web Chat with GitHub Stargazer Components](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/10.a.customization-card-components)

Note: We do not recommend creating custom activity types. Instead, please use the `event` activity type.
