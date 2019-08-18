import 'core-js/modules/es.array.includes';
import 'core-js/modules/es.array.iterator';
import 'core-js/modules/es.promise';
import 'core-js/modules/es.symbol';
import 'url-search-params-polyfill';
import 'whatwg-fetch';

import { embedConfigurationURL, embedTelemetryURL } from './urlBuilder';
import { error, log, warn } from './logger';
import { normalize as normalizeLocale } from './locale';
import fetchJSON from './fetchJSON';
import servicingPlan from '../servicingPlan.json';
import setup from './setups/index';
import loadIFRAME from './setups/loadIFRAME';

const MAX_VERSION_REDIRECTIONS = 10;

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
      warn(`Version "${version}" has an invalid rule "${rule}", skipping.`);

      continue;
    }

    if (found) {
      return redirectVersion;
    }
  }
}

export function findService(servicingPlan, bot, requestedVersion = 'default') {
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

    if (!service || (publicOnly && service.private)) {
      warn(`There is no version "${requestedVersion}" or it is marked as private; falling back to "default".`);

      requestedVersion = 'default';
      publicOnly = true;

      continue;
    }

    const { redirects } = service || {};

    if (redirects) {
      logs.push(`Executing redirection rules of version "${requestedVersion}".`);

      const actualVersion = execRedirectRules(bot, redirects, requestedVersion) || {};

      if (actualVersion) {
        requestedVersion = actualVersion;
        publicOnly = false;
      } else {
        warn(`Version "${requestedVersion}" did not have a fallback plan; falling back to default version.`);

        requestedVersion = 'default';
        publicOnly = true;
      }

      continue;
    }

    log(
      [
        'Selecting version ',
        traversedVersions
          .map(version => (typeof version === 'undefined' ? '<undefined>' : `"${version}"`))
          .join(' -> '),
        '.'
      ].join('')
    );

    return service;
  }

  throw new Error(`Maximum version redirections exceeded. This is probably problem with our servicing plan.`);
}

function parseParams(search) {
  const params = new URLSearchParams(search);

  const botId = params.get('b') || undefined;
  const language = normalizeLocale(params.get('l') || navigator.language);
  const token = params.get('t') || undefined;
  const userId = params.get('userid') || undefined;
  const username = params.get('username') || undefined;
  const version = params.get('v') || undefined;

  const secret = token ? undefined : params.get('s') || undefined;

  return {
    botId,
    language,
    secret,
    token,
    userId,
    username,
    version
  };
}

export default async function main(search) {
  const params = parseParams(search);
  const { botId, secret, token, version } = params;

  if (!secret && !token) {
    await loadIFRAME('/404.html');

    throw new Error(`You must specify either a secret or a token.`);
  }

  let bot;

  try {
    bot = await fetchJSON(
      embedConfigurationURL(botId, {
        secret,
        token,
        userId: params.userId
      }),
      { credentials: 'include' }
    );
  } catch (err) {
    await loadIFRAME('/404.html');

    throw err;
  }

  document.title = bot.botName;

  const service = findService(servicingPlan, bot, version);
  const { deprecation } = service;

  deprecation && warn(deprecation);

  const { version: actualVersion } = await setup(service, bot, params);
  const dataPoints = {
    [`actualversion:${actualVersion}`]: 1,
    [`expectversion:${(version || '').substr(0, 10)}`]: version,
    [`userid:${bot.userIdSource}`]: 1,
    speech: bot.speech,
    websocket: bot.webSocket
  };

  const res = await fetch(
    embedTelemetryURL(botId, { secret, token }, Object.keys(dataPoints).filter(name => dataPoints[name])),
    { mode: 'no-cors' }
  );

  res.text();
}

main(location.search).catch(({ stack = '' }) =>
  error(['Unhandled exception caught when loading.', '', ...stack.split('\n')].join('\n'))
);
