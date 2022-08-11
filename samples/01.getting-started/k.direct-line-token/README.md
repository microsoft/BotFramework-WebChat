# Direct Line Token Sample

# Description

This sample demonstrates how to integrate Web Chat in a way that 1) does not expose your Direct Line secret to the browser, and 2) mitigates user impersonation by not allowing the client to set its own user ID.

See the [Motivation](#Motivation) section below for more background on these issues.

# Test out the hosted sample

There is no hosted demo for this sample yet.

# How to run locally

This demo includes a bot that you will run locally, so before running the code, you will have to set up an Azure Bot Service resource.

1. [Clone the code](#clone-the-code)
1. [Setup Azure Bot Services](#setup-azure-bot-services)
1. [Prepare and run the code](#prepare-and-run-the-code)

## Clone the code

To host this demo, you will need to clone the code and run locally.

<details><summary>Clone the JavaScript project</summary>

1. Clone this repository
1. Create two empty files for environment variables, `/bot/.env` and `/web/.env`

</details>

<details><summary>Clone the C# project</summary>

1. Clone this repository
1. Open the two `appsettings.json` files at `/bot/appsettings.json` and `/web/appsettings.json`

</details>

## Setup Azure Bot Services

You can follow our instructions on how to [create an Azure Bot resource](https://docs.microsoft.com/en-us/azure/bot-service/abs-quickstart?view=azure-bot-service-4.0&tabs=userassigned#create-the-resource). Then save the resulting IDs/secrets into the appropriate local environment files, depending on your language:

<details><summary>JavaScript</summary>

1. Save the Microsoft App ID and password to `/bot/.env`
   -  ```
      MICROSOFT_APP_ID=12345678abcd-1234-5678-abcd-12345678abcd
      MICROSOFT_APP_PASSWORD=<your-microsoft-app-password>
      ```
1. Save the Web Chat secret to `/web/.env`
   -  ```
      DIRECT_LINE_SECRET=<your-direct-line-secret>
      ```

</details>

<details><summary>C#</summary>

1. Save the Microsoft App ID and password to `/bot/appsettings.json`
   -  ```
      "MicrosoftAppId": "12345678abcd-1234-5678-abcd-12345678abcd"
      "MicrosoftAppPassword": "<your-microsoft-app-password>"
      ```
1. Save the Web Chat secret to `/web/appsettings.json`
   -  ```
      "DirectLineSecret": "<your-direct-line-secret>"
      ```

</details>

During development, you will run your bot locally. Azure Bot Services will send activities to your bot thru a public URL. You can use [ngrok](https://ngrok.com/) to expose your bot server on a public URL.

1. Run `ngrok http -host-header=localhost:3978 3978`
1. Update your Bot Channel Registration. You can use [Azure CLI](https://aka.ms/az-cli) or [Azure Portal](https://portal.azure.com)
   -  Via Azure CLI
      -  Run `az bot update --resource-group <your-bot-rg> --name <your-bot-name> --subscription <your-subscription-id> --endpoint "https://a1b2c3d4.ngrok.io/api/messages"`
   -  Via Azure Portal
      -  Browse to your Bot Channel Registration
      -  Select "Settings"
      -  In "Configuration" section, set "Messaging Endpoint" to `https://a1b2c3d4.ngrok.io/api/messages`

## Prepare and run the code

1. Under each of `bot`, and `web` folder, run the following commands, depending on your language:

   <details><summary>JavaScript</summary>

   1. `npm install`
   1. `npm start`

   </details>

   <details><summary>C#</summary>

   1. `dotnet build`
   1. `dotnet run`

   </details>

1. Browse to http://localhost:5000/ to start the demo

# Things to try out

-  Type anything to the bot. It should reply with your user ID, which will stay the same for the duration of the session.
-  Open a new browser tab to http://localhost:5000 and type anything to the bot. It should reply with a different user ID since it has generated a different Direct Line token.

# Code

The code is organized into two separate folders:

-  `/bot/` is the bot server
-  `/web/` is the REST API for generating Direct Line tokens
   -  `GET /api/directline/token` will generate a new Direct Line token for the app. The token will be bound to a random user ID.
   -  During development-time, it will also serve the bot server via `/api/messages/`
      -  To enable this feature, add `PROXY_BOT_URL=http://localhost:3978` to `/web/.env`

## Constructing the user ID

In this sample, the user is anonymous, so the API randomly generates a user ID:

<details><summary>JavaScript</summary>

```js
// web/src/routes/directLine/token.js

async function generateRandomUserId() {
   const buffer = await randomBytesAsync(16);
   return `dl_${buffer.toString('hex')}`;
}
```

</details>

<details><summary>C#</summary>

```csharp
// web/Controllers/DirectLineController.cs

private static string GenerateRandomUserId()
{
    byte[] tokenData = new byte[16];
    using var rng = new RNGCryptoServiceProvider();
    rng.GetBytes(tokenData);

    return $"dl_{BitConverter.ToString(tokenData).Replace("-", "").ToLower()}";
}
```

</details>

The user ID is prefixed with "dl\_" as required by the [Direct Line token API](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0#generate-token).

## Retrieving a user-specific Direct Line token

The backend API calls the Direct Line API to retrieve a Direct Line token. Notice that we pass the user ID in the body of the request:

<details><summary>JavaScript</summary>

```js
// web/src/generateDirectLineToken.js

async function generateDirectLineToken(secret, userId) {
   const { token } = await fetchJSON('https://directline.botframework.com/v3/directline/tokens/generate', {
      headers: {
         authorization: `Bearer ${secret}`,
         'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
         user: {
            id: userId
         }
      })
   });

   return token;
}
```

</details>

<details><summary>C#</summary>

```csharp
// web/Services/DirectLineService.cs

httpClient.BaseAddress = new Uri("https://directline.botframework.com/");

...

public async Task<DirectLineTokenDetails> GetTokenAsync(string directLineSecret, string userId, CancellationToken cancellationToken = default)
{
    var tokenRequestBody = new { user = new { id = userId } };
    var tokenRequest = new HttpRequestMessage(HttpMethod.Post, "v3/directline/tokens/generate")
    {
        Headers =
        {
            { "Authorization", $"Bearer {directLineSecret}" },
        },
        Content = new StringContent(JsonSerializer.Serialize(tokenRequestBody), Encoding.UTF8, MediaTypeNames.Application.Json),
    };

    var tokenResponseMessage = await _httpClient.SendAsync(tokenRequest, cancellationToken);

    ...

    using var responseContentStream = await tokenResponseMessage.Content.ReadAsStreamAsync();
    var tokenResponse = await JsonSerializer.DeserializeAsync<DirectLineTokenApiResponse>(responseContentStream);

    return new DirectLineTokenDetails
    {
        Token = tokenResponse.Token,
        ConversationId = tokenResponse.ConversationId,
        ExpiresIn = tokenResponse.ExpiresIn,
    };
}
```

</details>

The resulting Direct Line token will be bound to the passed user ID.

## Calling the API and rendering Web Chat

The client-side page calls the API and uses the resulting Direct Line token to render Web Chat:

```js
// public/index.html

const { token } = await fetchJSON('/api/directline/token');

WebChat.renderWebChat(
   {
      directLine: WebChat.createDirectLine({ token }),
      styleOptions: {
         backgroundColor: 'rgba(255, 255, 255, .8)'
      }
   },
   document.getElementById('webchat')
);
```

Note that we do _not_ specify a user ID when initiating Web Chat. Direct Line will handle sending the user ID to the bot based on the token.

# Overview

This sample includes multiple parts:

-  **The UI** is a static HTML/JS web page with Web Chat integrated via JavaScript bundle. It makes a POST request to the backend API and uses the resulting Direct Line token to render Web Chat.
-  **The backend API** generates Direct Line tokens. Each generated token is bound to a new, randomly-generated user ID.
-  **The bot** is a bare-bones bot that responds to every message by sending the user's ID.

## Motivation

### Hiding the Web Chat secret

When embedding Web Chat into a site, you must provide either your Direct Line secret or a Direct Line token so that Web Chat can communicate with the bot. The Direct Line secret can be used to access all of the bot's conversations, and it doesn't expire. A Direct Line token can only be used to access a single conversation, and it does expire. See the [Direct Line Authentication documentation](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0) for more information.

Therefore, embedding Web Chat using the Direct Line secret directly is strongly discouraged because it would expose your secret on the client-side. Instead, the recommended approach is to exchange the secret for a Direct Line token on the server-side. This sample shows how to obtain and use the token.

### Avoiding user impersonation

Web Chat allows you to specify a user ID on the client-side, which will be sent in activities to the bot. However, this is susceptible to user impersonation because a malicious user could modify their user ID. Since the user ID typically isn't verified, this is a security risk if the bot stores sensitive data keyed on the user ID. For example, the built-in [user authentication support in Azure Bot Service](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-concept-authentication?view=azure-bot-service-4.0) associates access tokens with user IDs.

To avoid impersonation, the recommended approach is for the server to bind a user ID to the Direct Line token. Then any conversation using that token will send the bound user ID to the bot. However, if the client is going to provide the user ID to the server, it is important for the server to validate the ID somehow (see below). Otherwise, a malicious user could still modify the user ID being sent by the client.

To keep things simple, this sample generates a random user ID on the server-side and binds it to the Direct Line token. While this mitigates impersonation concerns, the downside is that users will have a different ID every time they talk to the bot.

## Content of the local environment files

The `.env` / `appsettings.json` files hold the environment variable critical to run the service. These are usually security-sensitive information and must not be committed to version control. Although we recommend to keep them in [Azure Key Vault](https://azure.microsoft.com/en-us/services/key-vault/), for simplicity of this sample, we would keep them in local environment files.

To ease the setup of this sample, here is the template of the local environment files for each language.

<details><summary>JavaScript</summary>

### `/bot/.env`

```
MICROSOFT_APP_ID=12345678abcd-1234-5678-abcd-12345678abcd
MICROSOFT_APP_PASSWORD=<your-microsoft-app-password>
```

### `/web/.env`

```
DIRECT_LINE_SECRET=<your-direct-line-secret>
```

</details>

<details><summary>C#</summary>

### `/bot/appsettings.json`

```json
{
   "Logging": {
      "LogLevel": {
         "Default": "Information",
         "Microsoft": "Warning",
         "Microsoft.Hosting.Lifetime": "Information"
      }
   },
   "AllowedHosts": "*",
   "MicrosoftAppId": "12345678abcd-1234-5678-abcd-12345678abcd",
   "MicrosoftAppPassword": "<your-microsoft-app-password>"
}
```

### `/web/appsettings.json`

```json
{
   "Logging": {
      "LogLevel": {
         "Default": "Information",
         "Microsoft": "Warning",
         "Microsoft.Hosting.Lifetime": "Information"
      }
   },
   "AllowedHosts": "*",
   "DirectLineSecret": "<your-direct-line-secret>"
}
```

</details>

# Frequently asked questions

## What if I need a consistent user ID across sessions/devices?

Instead of randomly generating user IDs, the backend API could leverage a user's existing identity from a true identity provider. The user would first sign in to the site before talking to the bot. That way, if the user signed in using the same identity on a different browser or device, the user ID would be the same. This would also prevent user impersonation because we could verify the user's identity with the identity provider before issuing a Direct Line token.

The flow could be:

1. The user signs in to the web app.
1. The web app calls the backend API for generating Direct Line tokens, providing a verifiable user token.
1. The backend API verifies the user token with the identity provider.
1. The backend API uses the token to get an ID for the user. (The specifics will vary based on the identity provider and type of token.)
1. The backend API generates a Direct Line token bound to the user ID (just as this sample does) and returns it to the web app.

# Further reading

-  [Create an Azure Bot resource](https://docs.microsoft.com/en-us/azure/bot-service/abs-quickstart?view=azure-bot-service-4.0&tabs=userassigned#create-the-resource)
-  [Generating a Direct Line token](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0#generate-token)
-  [Enhanced Direct Line Authentication feature](https://blog.botframework.com/2018/09/25/enhanced-direct-line-authentication-features/)
