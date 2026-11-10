/**
 * @jest-environment @happy-dom/jest-environment
 */
// The dispatch() given to card action middleware without a Redux store, against the store's dispatch() (on the sagas and
// on the machines): the raw send
// actions (and their faults) do the same on both, compared after every step as the other parity specs. Other actions
// are ignored with a warning: Redux mode reduces them, so that part is checked on its own.
import { REDUX_DRIVERS } from '../__tests__/parity/createReduxDriver';
import createServicesDriver from '../__tests__/parity/createServicesDriver';
import runParityScript from '../__tests__/parity/runParityScript';
import sendScripts from '../__tests__/parity/sendScripts';
import createCompatibilityDispatch from './createCompatibilityDispatch';

const scripts = Object.fromEntries(Object.entries(sendScripts).filter(([name]) => /^dispatch\b/u.test(name)));

describe.each(Object.keys(scripts))('%s', name => {
  test.each(REDUX_DRIVERS)('the services do what Redux mode does, on the %s', async (_, createReduxDriver) => {
    // eslint-disable-next-line security/detect-object-injection
    const script = scripts[name];
    const sagas = await runParityScript(createReduxDriver, script);
    const services = await runParityScript(createServicesDriver, script);

    expect(services).toStrictEqual(sagas);
  });
});

describe('createCompatibilityDispatch()', () => {
  const { NODE_ENV } = process.env;
  let outgoing: Parameters<typeof createCompatibilityDispatch>[0]['outgoing'];
  let warn: jest.SpyInstance;

  beforeEach(() => {
    outgoing = {
      postActivity: jest.fn(),
      sendEvent: jest.fn(),
      sendFiles: jest.fn(),
      sendMessage: jest.fn(),
      sendMessageBack: jest.fn(),
      sendPostBack: jest.fn(),
      whileOnline: jest.fn(fn => fn())
    };
    warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env.NODE_ENV = NODE_ENV;
    warn.mockRestore();
  });

  test('maps the 6 send actions to the outgoing service, reading them while online, and returns the action', () => {
    const dispatch = createCompatibilityDispatch({ outgoing });
    const message = { payload: { text: 'm' }, type: 'WEB_CHAT/SEND_MESSAGE' };

    expect(dispatch(message)).toBe(message);
    dispatch({ payload: { value: 1 }, type: 'WEB_CHAT/SEND_MESSAGE_BACK' });
    dispatch({ payload: { value: 2 }, type: 'WEB_CHAT/SEND_POST_BACK' });
    dispatch({ payload: { name: 'e' }, type: 'WEB_CHAT/SEND_EVENT' });
    dispatch({ payload: { files: [] }, type: 'WEB_CHAT/SEND_FILES' });
    dispatch({
      meta: { method: 'code' },
      payload: { activity: { type: 'message' } },
      type: 'DIRECT_LINE/POST_ACTIVITY'
    });

    expect(outgoing.whileOnline).toHaveBeenCalledTimes(6);
    expect(outgoing.sendMessage).toHaveBeenCalledWith({ text: 'm' });
    expect(outgoing.sendMessageBack).toHaveBeenCalledWith({ value: 1 });
    expect(outgoing.sendPostBack).toHaveBeenCalledWith({ value: 2 });
    expect(outgoing.sendEvent).toHaveBeenCalledWith({ name: 'e' });
    expect(outgoing.sendFiles).toHaveBeenCalledWith({ files: [] });
    expect(outgoing.postActivity).toHaveBeenCalledWith({ type: 'message' }, 'code');
    expect(warn).not.toHaveBeenCalled();
  });

  test('ignores other actions, with one warning per type in development', () => {
    const dispatch = createCompatibilityDispatch({ outgoing });
    const action = { payload: { text: 'x' }, type: 'WEB_CHAT/SET_SEND_BOX' };

    expect(dispatch(action)).toBe(action);
    dispatch(action);
    dispatch({ type: 'WEB_CHAT/STOP_DICTATE' });

    expect(outgoing.whileOnline).not.toHaveBeenCalled();
    expect(warn.mock.calls.map(([message]) => message)).toEqual([
      expect.stringContaining('Ignored: "WEB_CHAT/SET_SEND_BOX". Pass a "store" to use other actions.'),
      expect.stringContaining('Ignored: "WEB_CHAT/STOP_DICTATE"')
    ]);
  });

  test('does not warn in production', () => {
    process.env.NODE_ENV = 'production';

    createCompatibilityDispatch({ outgoing })({ type: 'WEB_CHAT/SET_SEND_BOX' });

    expect(warn).not.toHaveBeenCalled();
  });

  test('throws as Redux on what is not an action', () => {
    const dispatch = createCompatibilityDispatch({ outgoing });

    expect(() => dispatch(() => 0)).toThrow("Actions must be plain objects. Instead, the actual type was: 'function'.");
    expect(() => dispatch(null)).toThrow("the actual type was: 'null'");
    expect(() => dispatch({})).toThrow('Actions may not have an undefined "type" property.');
  });
});
