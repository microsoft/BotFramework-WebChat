# Upload attachment to Azure Storage demo

[![Deploy Status](https://fuselabs.vsrm.visualstudio.com/_apis/public/Release/badge/531382a8-71ae-46c8-99eb-9512ccb91a43/10/10)](https://webchat-sample-upload-to-azure.azurewebsites.net/)

# Description

In this demo, we will show you how to customize Web Chat to directly upload file(s) to Azure Storage, and then send the blob URL to the bot for validation and further processing.

## Background

Direct Line provides a temporary storage of user attachments, up to 4 MB per attachment for about 24 hours. If the end-user needs to upload more than 4 MB, it is always advised that the developer use their own storage.

> IMPORTANT: When handling user input such as attachments, please verify that the attachment is free of inappropriate content and is what your bot expected to receive.

> IMPORTANT: When dealing with personal data, please respect user privacy. Follow platform guidelines and post your privacy statement online.

# Test out the hosted sample

You can browse to https://webchat-sample-upload-to-azure.azurewebsites.net/ to try out the hosted demo.

# How to run locally

This demo integrates with multiple services. There are multiple services you need to setup in order to host the demo.

1. [Clone the code](#clone-the-code)
1. [Setup Azure Storage](#setup-azure-storage)
1. [Setup Azure Bot Services](#setup-azure-bot-services)
1. [Prepare and run the code](#prepare-and-run-the-code)

## Clone the code

To host this demo, you will need to clone the code and run locally.

1. Clone this repository
1. Create two empty files for environment variables, `/bot/.env` and `/web/.env`

## Setup Azure Storage

This will create a new Azure Storage for temporary storage of user uploads.

1. Sign into Azure Portal and create a new storage account
   1. Browse to https://ms.portal.azure.com/#create/Microsoft.StorageAccount
   1. Fill out "Storage account name", for example, `webchatsampleuploadtoazure`
   1. Click "Review + create"
1. Save the account name and key
   1. Select "Access keys"
   1. Copy "Storage account name" and save it to both `/bot/.env` and `/web/.env`
      - `AZURE_STORAGE_ACCOUNT_NAME=youraccountname`
   1. Copy "Key" of "key1" and save it to both `/bot/.env` and `/web/.env`
      - `AZURE_STORAGE_ACCOUNT_KEY=a1b2c3d`
1. Create a new blob container named "userupload"
   1. Select "Blobs"
   1. Click "+ Container"
   1. In the "Name" field, type `userupload`
   1. Leaves the "Public access level" field as "Private (no anonymous access)"
   1. Click "OK"
1. Add an automatic clean up rule
   1. Select "Lifecycle Management"
   1. Click "Add rule"
   1. In "Rule name" field, type `clean-up-userupload`
   1. Check "Delete blob"
   1. In "Days after last modification" field under "Delete blob", type `1`
   1. Click "Next : Filter set >"
   1. Under "Prefix match", type `userupload`
   1. Click "Next : Review + add >"
   1. Click "Add"

## Setup Azure Bot Services

> We prefer to use [Bot Channel Registration](https://ms.portal.azure.com/#create/Microsoft.BotServiceConnectivityGalleryPackage) during development. This will help you diagnose problems locally without deploying to the server and speed up development.

You can follow our instructions on how to [setup a new Bot Channel Registration](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-registration?view=azure-bot-service-3.0).

1. Save the Microsoft App ID and password to `/bot/.env`
   -  `MICROSOFT_APP_ID=12345678-1234-5678-abcd-12345678abcd`
   -  `MICROSOFT_APP_PASSWORD=a1b2c3d4e5f6`
1. Save the Web Chat secret to `/web/.env`
   -  `DIRECT_LINE_SECRET=a1b2c3.d4e5f6g7h8i9j0`

> When you are building your production bot, never expose your Web Chat or Direct Line secret to the client. Instead, you should use the secret to generate a limited token and send it to the client. For information, please refer the documentation on [Direct Line token generation](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0#generate-token) and the [Enhanced Direct Line Authentication feature](https://blog.botframework.com/2018/09/25/enhanced-direct-line-authentication-features/).

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

1. Under each of `bot`, and `web` folder, run the following
   1. `npm install`
   1. `npm start`
1. Browse to http://localhost:3000/ to start the demo

# Things to try out

- Type anything to the bot, it should reply and ask you to upload files
- Upload a file
   - It should response with the file size of each file you uploaded
   - In your Azure Storage container, you will see the uploaded files

# Code

-  `/bot/` is the bot server
-  `/web/` is the REST API for distributing Shared Access Signature tokens
   -  `GET /api/directline/token` will generate a new Direct Line token for the React app
   -  `GET /api/azurestorage/uploadsastoken` will generate a new Shared Access Signature token for the web app to upload a file
   -  During development-time, it will also serve the bot server via `/api/messages/`
      -  To enable this feature, add `PROXY_BOT_URL=http://localhost:3978` to `/web/.env`

# Overview

This sample includes multiple parts:

-  A basic web page with Web Chat integrated via JavaScript bundle
-  An Azure Storage with blob container named `userupload`
-  A Restify web server for distributing tokens
   -  A REST API that generate Direct Line token for new conversations
   -  A REST API that generate Shared Access Signature token for temporary storage of attachment
-  A bot that would verify and process uploaded attachment

## Goals

-  When end-user send one or more attachments, it will be uploaded to Azure Storage using Shared Access Signature token
   -  For security reason, the token should not allow the bearer to re-download the file
   -  After upload, Web Chat will send an event activity named "upload" to the bot with blob URLs
-  When the bot receive the "upload" event activity, it will start validating each uploaded blob and process it
-  Azure Storage for temporary upload will be automatically cleaned up daily

### Uploading attachment

When end-user start uploading files, Web Chat will dispatch `WEB_CHAT/SEND_FILES` action. In our web app, we will intercept this action. Instead, we will read each attachment as `ArrayBuffer` and upload to Azure Storage using SAS token.

After all attachments are uploaded to Azure Storage, we will send an event activity named `upload` to the bot with the array of URLs pointing to every attachment.

> Note: the SAS token allows user to upload huge files that may incurs unexpected charges to your system. You should take countermeasures against abuse. For example, using reverse-proxy, removing files more frequently, or capping the size that your system can handle per hour based on certain demographic data.

### Processing attachment

> It is critical to verify the uploaded files before continue processing them in your system.

When the bot receive event activity named `upload`, it will start validating the content of the file, and respond to the end-user with the result of validation.

In our sample, we will only read metadata and properties from each blob, and respond with a thumbnail card.

In your production system, you should always verify if the uploaded file is valid and contains appropriate content. To continue processing the files, you should copy the uploaded files into a separate container. You can use [Azure Service Bus](https://docs.microsoft.com/en-us/azure/service-bus/) or [Azure Queue Storage](https://azure.microsoft.com/en-us/services/storage/queues/) for long-processing jobs.

### Automatic clean up of temporary storage

We will use [Lifecycle Management] feature from Azure Storage. For details, you can read [this article](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-lifecycle-management-concepts).

## Content of the `.env` files

The `.env` file hold the environment variable critical to run the service. These are usually security-sensitive information and must not be committed to version control. Although we recommend to keep them in [Azure Key Vault](https://azure.microsoft.com/en-us/services/key-vault/), for simplicity of this sample, we would keep them in `.env` files.

To ease the setup of this sample, here is the template of `.env` files.

### `/bot/.env`

```
AZURE_STORAGE_ACCOUNT_NAME=youraccountname
AZURE_STORAGE_ACCOUNT_KEY=a1b2c3d
MICROSOFT_APP_ID=12345678-1234-5678-abcd-12345678abcd
MICROSOFT_APP_PASSWORD=a1b2c3d4e5f6
```

### `/web/.env`

```
AZURE_STORAGE_ACCOUNT_NAME=youraccountname
AZURE_STORAGE_ACCOUNT_KEY=a1b2c3d
DIRECT_LINE_SECRET=a1b2c3.d4e5f6g7h8i9j0
```

# Frequently asked questions

## Why using an event activity for uploaded files?

Currently, DirectLineJS (0.11.4) will inspect every outgoing activity. If the `attachments` array is not empty, it will read the `contentURL` from every attachment, download the content as `Blob` using the `contentURL`, and then send a multipart message to the Direct Line channel. Today, the `contentURL` is constructed by converting a `File` object into a URL through the [`URL.createObjectURL` function](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) and is prefixed with `blob:` protocol.

Thus, if we use `attachments` array to send blob URLs to the bot, DirectLineJS will try to re-download every file and send it to Direct Line channel again.

As there are no workarounds for this behavior, we will need to use a mechanism other than the `attachments` array.

Since revoking the URL created through `createObjectURL` is not trivial, there is a possibility that in the future we might change this behavior in DirectLineJS to use `ArrayBuffer` or `Blob` directly.

# Further reading

-  [Setting up a new Bot Channel Registration](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-quickstart-registration?view=azure-bot-service-3.0)
-  [Generating a Direct Line token](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0#generate-token)
-  [Enhanced Direct Line Authentication feature](https://blog.botframework.com/2018/09/25/enhanced-direct-line-authentication-features/)
-  [Azure Storage: Setting up storage lifecycle management](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-lifecycle-management-concepts)
