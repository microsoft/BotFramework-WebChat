import { scenario } from '@testduet/given-when-then';
import type RemoveBearerInAuthorizationTokenType from './removeBearerInAuthorizationToken';

let removeBearerInAuthorizationToken: typeof RemoveBearerInAuthorizationTokenType;
let consoleWarn: jest.SpyInstance;

beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

  jest.mock('@msinternal/botframework-webchat-base/utils', () => ({
    ...jest.requireActual('@msinternal/botframework-webchat-base/utils'),
    warnOnce:
      (...args) =>
      () =>
        console.warn(...args)
  }));

  removeBearerInAuthorizationToken = require('./removeBearerInAuthorizationToken').default;
});

afterEach(() => consoleWarn.mockClear());

scenario('Authorization token prefixed with "Bearer" in ', bdd => {
  bdd
    .given('resolved value', () => ({
      authorizationToken: 'Bearer XYZ',
      region: 'westus'
    }))
    .when('removeBearerInAuthorizationToken', precondition => removeBearerInAuthorizationToken(precondition))
    .then('should match snapshot', (_, result) =>
      expect(result).toEqual({
        authorizationToken: 'XYZ',
        region: 'westus'
      })
    )
    .and('should have warned', () => expect(consoleWarn).toHaveBeenCalledTimes(1));

  bdd
    .given('Promise value', () =>
      Promise.resolve({
        authorizationToken: 'Bearer XYZ',
        region: 'westus'
      })
    )
    .when('removeBearerInAuthorizationToken', precondition => removeBearerInAuthorizationToken(precondition))
    .then('should match snapshot', (_, result) =>
      expect(result).toEqual({
        authorizationToken: 'XYZ',
        region: 'westus'
      })
    )
    .and('should have warned', () => expect(consoleWarn).toHaveBeenCalledTimes(1));

  bdd
    .given('callback of a resolved value', () => () => ({
      authorizationToken: 'Bearer XYZ',
      region: 'westus'
    }))
    .when('removeBearerInAuthorizationToken', precondition => (removeBearerInAuthorizationToken(precondition) as any)())
    .then('should match snapshot', (_, result) =>
      expect(result).toEqual({
        authorizationToken: 'XYZ',
        region: 'westus'
      })
    )
    .and('should have warned', () => expect(consoleWarn).toHaveBeenCalledTimes(1));

  bdd
    .given(
      'callback of a Promise',
      () => () =>
        Promise.resolve({
          authorizationToken: 'Bearer XYZ',
          region: 'westus'
        })
    )
    .when('removeBearerInAuthorizationToken', precondition => (removeBearerInAuthorizationToken(precondition) as any)())
    .then('should match snapshot', async (_, result) =>
      expect(await result).toEqual({
        authorizationToken: 'XYZ',
        region: 'westus'
      })
    )
    .and('should have warned', () => expect(consoleWarn).toHaveBeenCalledTimes(1));
});

scenario('Authorization token with no prefix in ', bdd => {
  bdd
    .given('resolved value', () => ({
      authorizationToken: 'XYZ',
      region: 'westus'
    }))
    .when('removeBearerInAuthorizationToken', precondition => removeBearerInAuthorizationToken(precondition))
    .then('should left untouched', (precondition, result) => expect(result).toBe(precondition))
    .and('should not have warned', () => expect(consoleWarn).not.toHaveBeenCalled());

  bdd
    .given('Promise value', () =>
      Promise.resolve({
        authorizationToken: 'XYZ',
        region: 'westus'
      })
    )
    .when('removeBearerInAuthorizationToken', precondition => removeBearerInAuthorizationToken(precondition))
    .then('should match snapshot', (_, result) =>
      expect(result).toEqual({
        authorizationToken: 'XYZ',
        region: 'westus'
      })
    )
    .and('should not have warned', () => expect(consoleWarn).not.toHaveBeenCalled());

  bdd
    .given('callback of a resolved value', () => () => ({
      authorizationToken: 'XYZ',
      region: 'westus'
    }))
    .when('removeBearerInAuthorizationToken', precondition => (removeBearerInAuthorizationToken(precondition) as any)())
    .then('should match snapshot', (_, result) =>
      expect(result).toEqual({
        authorizationToken: 'XYZ',
        region: 'westus'
      })
    )
    .and('should not have warned', () => expect(consoleWarn).not.toHaveBeenCalled());

  bdd
    .given(
      'callback of a Promise',
      () => () =>
        Promise.resolve({
          authorizationToken: 'XYZ',
          region: 'westus'
        })
    )
    .when('removeBearerInAuthorizationToken', precondition => (removeBearerInAuthorizationToken(precondition) as any)())
    .then('should match snapshot', async (_, result) =>
      expect(await result).toEqual({
        authorizationToken: 'XYZ',
        region: 'westus'
      })
    )
    .and('should not have warned', () => expect(consoleWarn).not.toHaveBeenCalled());
});
