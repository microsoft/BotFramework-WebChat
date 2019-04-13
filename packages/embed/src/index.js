import '@babel/polyfill';

import arrayify from './arrayify';
import createElement from './createElement';
import fetchJSON from './fetchJSON';
import loadAsset from './loadAsset';
import { embedConfigurationURL, servicingPlanURL } from './urlBuilder';

const MAX_VERSION_REDIRECTIONS = 10;

function createLog(log, prefix) {
  return message => log([prefix, message].join(' '));
}

const error = createLog(console.error.bind(console), 'Web Chat:');
const log = createLog(console.log.bind(console), 'Web Chat:');
const warn = createLog(console.warn.bind(console), 'Web Chat:');

function execRedirectRules(bot, redirects, version) {
  const featurePattern = /^feature:(.+)/;

  for (let [rule, redirectVersion] of redirects) {
    const featureMatch = featurePattern.exec(rule);
    let found;

    if (rule === '*') {
      found = true;
    } else if (featureMatch) {
      found = bot.features.includes(featureMatch[1]);
    } else {
      warn(`Version "${ version }" has an invalid rule "${ rule }", skipping.`);

      continue;
    }

    if (found) {
      return redirectVersion;
    }
  }
}

function findService(servicingPlan, bot, requestedVersion = 'default') {
  const traversedVersions = [];
  const logs = [];
  let publicOnly = true;
  const { versions } = servicingPlan;

  if (!versions['default']) {
    throw new Error(`There is no default version specified in the servicing plan.`);
  }

  for (let hop = MAX_VERSION_REDIRECTIONS; hop >= 0; hop--) {
    let service = versions[requestedVersion];

    traversedVersions.push(requestedVersion);

    if (
      !service
      || (publicOnly && service.private)
    ) {
      warn(`There is no version "${ requestedVersion }" or it is marked as private, falling back to "default".`);

      requestedVersion = 'default';
      publicOnly = true;

      continue;
    }

    const { redirects } = service || {};

    if (redirects) {
      logs.push(`Executing redirection rules of version "${ requestedVersion }".`);

      const actualVersion = execRedirectRules(bot, redirects, requestedVersion) || {};

      if (actualVersion) {
        requestedVersion = actualVersion;
        publicOnly = false;
      } else {
        warn(`Version "${ requestedVersion }" did not have a fallback plan, falling back to default version.`);

        requestedVersion = 'default';
        publicOnly = true;
      }

      continue;
    }

    log([
      'Selecting version ',
      traversedVersions
        .map(version => typeof version === 'undefined' ? '<undefined>' : `"${ version }"`)
        .join(' -> '),
      '.'
    ].join(''));

    return {
      service,
      version: requestedVersion
    };
  }

  throw new Error(`Maximum version redirections exceeded, probably problem with our servicing plan.`);
}

async function getBingSpeechToken(directLineToken, bingSpeechTokenURL) {
  const res = await fetch(
    `${ bingSpeechTokenURL }?goodForInMinutes=10`,
    {
      headers: { Authorization: `Bearer ${ directLineToken }` }
    }
  );

  if (!res.ok) {
    throw new Error('Failed to get Bing Speech token');
  }

  const { access_Token: accessToken } = await res.json();

  return accessToken;
}

function setupVersionFamily1({ botId }, { secret, token }) {
  // Version 1 also depends on your token.
  // If you are using a token on Aries, you get Aries (v1).
  // If you are using a token on Scorpio, you get Scorpio (v3).

  const root = document.getElementById('root');
  const params = new URLSearchParams();

  secret && params.set('s', secret);
  token && params.set('t', token);

  root.appendChild(createElement(
    'iframe',
    { src: `https://webchat.botframework.com/embed/${ encodeURI(botId) }?${ params }` }
  ));

  root.style = 'overflow: hidden;';
}

function setupVersionFamily3(
  {
    botId,
    directLineURL: domain,
    speechTokenURL,
    userId,
    webSocket
  },
  {
    secret,
    token,
    username
  }
) {
  let speechOptions;

  if (speechTokenURL && speechTokenURL.bingSpeech && token) {
    speechOptions = {
      speechRecognizer: new CognitiveServices.SpeechRecognizer({
        fetchCallback: () => getBingSpeechToken(token, speechTokenURL.bingSpeech),
        fetchOnExpiryCallback: () => getBingSpeechToken(token, speechTokenURL.bingSpeech)
      }),
      speechSynthesizer: new BotChat.Speech.BrowserSpeechSynthesizer()
    };
  }

  window.BotChat.App({
    directLine: { domain, secret, token, webSocket },
    bot: { id: botId },
    locale: navigator.language,
    resize: 'window',
    speechOptions,
    user: {
      // Starting from Web Chat v4, we will automatically randomize a user ID
      // TODO: Use RNG or server-generated user ID
      id: userId,
      name: username || 'You'
    }
  }, document.getElementById('root'));
}

function setupVersionFamily4(
  {
    botIconURL,
    directLineURL: domain,
    userId,
    webSocket
  }, {
    secret,
    token,
    username
  }
) {
  const directLine = window.WebChat.createDirectLine({ domain, secret, token, webSocket });

  // TODO: Should we support Bing Speech in Web Chat v4?

  window.WebChat.renderWebChat({
    directLine,
    locale: navigator.language,
    styleOptions: {
      // TODO: We could move this line inside ASP.NET handler.
      //       This is essentially filling it out with default URL if it is empty.
      //       But in Web Chat v4, we prefer it to be empty instead.
      botAvatarImage: botIconURL === '//bot-framework.azureedge.net/bot-icons-v1/bot-framework-default.png' ? null : botIconURL
    },
    userId,
    username
  }, document.getElementById('root'));

  const webChatVersionMeta = document.querySelector('head > meta[name="botframework-webchat:bundle:version"]');

  webChatVersionMeta && log(`Web Chat v4 is loaded and reporting version "${ webChatVersionMeta.getAttribute('content') }".`);
}

function parseParams(search) {
  const params = new URLSearchParams(search);

  const botId = params.get('b') || undefined;
  const token = params.get('t') || undefined;
  const userId = params.get('userid') || undefined;
  const username = params.get('username') || undefined;
  const version = params.get('v') || undefined;

  const secret = token ? undefined : params.get('s') || undefined;

  return {
    botId,
    secret,
    token,
    userId,
    username,
    version
  };
}

async function main() {
  const params = parseParams(location.search);
  const { botId, secret, token, version } = params;

  if (!secret && !token) {
    throw new Error(`You must specify either secret or token.`);
  }

  const [bot, servicingPlan] = await Promise.all([
    fetchJSON(
      embedConfigurationURL(botId, { secret, token, userId: params.userId }),
      { credentials: 'include' }
    ).catch(() => Promise.reject('Failed to fetch bot definition.')),
    fetchJSON(servicingPlanURL('scratch')).catch(() => Promise.reject(`Failed to fetch servicing plan.`))
  ]);

  const {
    service: {
      assets,
      deprecation,
      versionFamily
    }
  } = findService(servicingPlan, bot, version);

  await Promise.all(arrayify(assets).map(loadAsset));

  deprecation && warn(deprecation);

  switch (versionFamily) {
    case '1':
      setupVersionFamily1(bot, params);
      break;

    case '3':
      setupVersionFamily3(bot, params);
      break;

    default:
      setupVersionFamily4(bot, params);
      break;
  }
}

main().catch(({ stack = '' }) => error(['Unhandled exception caught when loading.', '', ...stack.split('\n')].join('\n')));
