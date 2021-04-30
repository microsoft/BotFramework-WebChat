## Migrating from Web Chat v3 to v4

There are three possible paths that migration might take when migrating from v3 to v4. First, please compare your beginning scenario:

### My current website integrates Web Chat using an `<iframe>` element obtained from Azure Bot Services. I want to upgrade to v4.

Starting from May 2019, we are rolling out v4 to websites that integrate Web Chat using `<iframe>` element. Please refer to [the embed documentation](https://github.com/microsoft/BotFramework-WebChat/tree/main/packages/embed) for information on integrating Web Chat using `<iframe>`.

### My website is integrated with Web Chat v3 and uses customization options provided by Web Chat, no customization at all, or very little of my own customization that was not available with Web Chat.

Please follow the implementation of sample [`00.migration/a.v3-to-v4`](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/00.migration/a.v3-to-v4) to convert your webpage from v3 to v4 of Web Chat.

### My website is integrated with a fork of Web Chat v3. I have implemented a lot of customization in my version of Web Chat, and I am concerned v4 is not compatible with my needs.

One of our team's favorite things about v4 of Web Chat is the ability to add customization **without the need to fork Web Chat**. Although this creates additional overhead for v3 users who forked Web Chat previously, we will do our best to support customers making the bump. Please use the following suggestions:

-  Take a look at the implementation of sample [`00.migration/a.v3-to-v4`](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/00.migration/a.v3-to-v4). This is a great starting place to get Web Chat up and running.
-  Next, please go through the [samples list](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples) to compare your customization requirements to what Web Chat has already provided support for. These samples are made up of commonly asked-for features for Web Chat.
-  If one or more of your features is not available in the samples, please look through our [open and closed issues](https://github.com/microsoft/BotFramework-WebChat/issues?utf8=%E2%9C%93&q=is%3Aissue+), [Samples label](https://github.com/microsoft/BotFramework-WebChat/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+label%3ASample), and the [Migration Support label](https://github.com/microsoft/BotFramework-WebChat/issues?q=is%3Aissue+migrate+label%3A%22Migration+Support%22) to search for sample requests and/or customization support for a feature you are looking for. Adding your comment to open issues will help the team prioritize requests that are in high demand, and we encourage participation in our community.
-  If you did not find your feature in the list of open requests, please feel free to [file your own request](https://github.com/microsoft/BotFramework-WebChat/issues/new). Just like the item above, other customers adding comments to your open issue will help us prioritize which features are most commonly needed across Web Chat users.
-  Finally, if you need your feature as soon as possible, we welcome [pull requests](https://github.com/microsoft/BotFramework-WebChat/compare) to Web Chat. If you have the coding experience to implement the feature yourself, we would very much appreciate the additional support! Creating the feature yourself will mean that it is available for your use on Web Chat more quickly, and that other customers looking for the same or similar feature may utilize your contribution.
-  Make sure to check out the rest of this `README` to learn more about v4.
