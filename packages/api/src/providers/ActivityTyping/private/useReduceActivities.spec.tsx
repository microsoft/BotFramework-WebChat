/** @jest-environment @happy-dom/jest-environment */
/// <reference types="jest" />
/// <reference types="node" />

import { render, type RenderResult } from '@testing-library/react';
import type { WebChatActivity } from 'botframework-webchat-core';
import React, { type ComponentType } from 'react';
import { type useActivities as UseActivitiesType } from '../../../hooks';
import type UseReduceActivitiesType from './useReduceActivities';

type UseReduceActivitiesFn = Parameters<typeof UseReduceActivitiesType>[0];

const ACTIVITY_TEMPLATE = {
  channelData: {
    'webchat:sequence-id': 0,
    'webchat:send-status': undefined
  },
  from: { id: 'bot', role: 'bot' },
  id: 'a-00001',
  text: '',
  timestamp: '2025-03-10T12:34:56.789Z',
  type: 'message'
} satisfies WebChatActivity & { type: 'message' };

describe('setup', () => {
  let HookApp: ComponentType<{ fn: UseReduceActivitiesFn }>;
  let useActivities: jest.Mock<ReturnType<typeof UseActivitiesType>, Parameters<typeof UseActivitiesType>>;
  let useReduceActivities: jest.Mock<
    ReturnType<typeof UseReduceActivitiesType>,
    Parameters<typeof UseReduceActivitiesType>
  >;
  let fn: jest.Mock<ReturnType<UseReduceActivitiesFn>, Parameters<UseReduceActivitiesFn>>;
  let renderResult: RenderResult;

  beforeEach(() => {
    jest.mock('../../../hooks', () => ({ __esModule: true, useActivities: jest.fn(() => [[]]) }));

    ({ useActivities } = require('../../../hooks'));

    useReduceActivities = jest.fn(require('./useReduceActivities').default);

    fn = jest.fn().mockImplementation((prevResult, activity) => ({
      maxText: prevResult?.maxText > activity['text'] ? prevResult?.maxText : activity['text']
    }));

    HookApp = ({ fn }) => {
      useReduceActivities(fn);

      return null;
    };
  });

  test('reduce nothing', () => {
    render(<HookApp fn={fn} />);

    expect(fn).toHaveBeenCalledTimes(0);
  });

  describe('when the first activity is received', () => {
    let firstActivity: WebChatActivity;

    beforeEach(() => {
      firstActivity = { ...ACTIVITY_TEMPLATE, id: 'a-00001', text: 'Aloha!' };

      useActivities.mockImplementationOnce(() => [[firstActivity]]);

      renderResult = render(<HookApp fn={fn} />);
    });

    describe('fn() should have been called', () => {
      test('once', () => expect(fn).toHaveBeenCalledTimes(1));
      test('with the activity', () =>
        expect(fn).toHaveBeenLastCalledWith(undefined, firstActivity, 0, expect.arrayContaining([])));
    });

    test('return value should be derived from the first activity', () =>
      expect(useReduceActivities).toHaveLastReturnedWith({ maxText: 'Aloha!' }));

    describe('when the second activity is received', () => {
      let secondActivity: WebChatActivity;

      beforeEach(() => {
        secondActivity = { ...ACTIVITY_TEMPLATE, id: 'a-00002', text: 'Hello, World!' };

        useActivities.mockImplementationOnce(() => [[firstActivity, secondActivity]]);

        renderResult.rerender(<HookApp fn={fn} />);
      });

      describe('fn() should have been called', () => {
        test('twice in total', () => expect(fn).toHaveBeenCalledTimes(2));
        test('with the second activity', () =>
          expect(fn).toHaveBeenLastCalledWith({ maxText: 'Aloha!' }, secondActivity, 1, expect.arrayContaining([])));

        test('return value should be derived from the second activity', () =>
          expect(useReduceActivities).toHaveLastReturnedWith({ maxText: 'Hello, World!' }));
      });

      describe('when the third activity is inserted between the first and second activity', () => {
        let thirdActivity: WebChatActivity;

        beforeEach(() => {
          thirdActivity = { ...ACTIVITY_TEMPLATE, id: 'a-00003', text: 'Morning!' };

          useActivities.mockImplementationOnce(() => [[firstActivity, thirdActivity, secondActivity]]);

          renderResult.rerender(<HookApp fn={fn} />);
        });

        describe('fn() should have been called', () => {
          // It should call 2 more times because the first one should be from cache.
          test('4 times in total', () => expect(fn).toHaveBeenCalledTimes(4));

          test('with the third activity on 3rd call', () =>
            expect(fn).toHaveBeenNthCalledWith(3, { maxText: 'Aloha!' }, thirdActivity, 1, expect.arrayContaining([])));
          test('with the second activity on 4th call', () =>
            expect(fn).toHaveBeenNthCalledWith(
              4,
              { maxText: 'Morning!' },
              secondActivity,
              2,
              expect.arrayContaining([])
            ));
        });

        test('return value should be derived from the third activity', () =>
          expect(useReduceActivities).toHaveLastReturnedWith({ maxText: 'Morning!' }));

        describe('when all activities are removed', () => {
          beforeEach(() => {
            useActivities.mockImplementationOnce(() => [[]]);

            renderResult.rerender(<HookApp fn={fn} />);
          });

          test('should not call fn()', () => expect(fn).toHaveBeenCalledTimes(4));
          test('return value should be undefined', () => expect(useReduceActivities).toHaveLastReturnedWith(undefined));
        });

        describe('when the third activity is being replaced', () => {
          let fourthActivity: WebChatActivity;

          beforeEach(() => {
            fourthActivity = { ...ACTIVITY_TEMPLATE, id: 'a-00004', text: 'Good morning!' };

            useActivities.mockImplementationOnce(() => [[firstActivity, fourthActivity, secondActivity]]);

            renderResult.rerender(<HookApp fn={fn} />);
          });

          describe('fn() should have been called', () => {
            // It should call 2 more times because the first one should be from cache.
            test('6 times in total', () => expect(fn).toHaveBeenCalledTimes(6));

            test('with the fourth activity on 5rd call', () =>
              expect(fn).toHaveBeenNthCalledWith(
                5,
                { maxText: 'Aloha!' },
                fourthActivity,
                1,
                expect.arrayContaining([])
              ));

            test('with the second activity on 6th call', () =>
              expect(fn).toHaveBeenNthCalledWith(
                6,
                { maxText: 'Good morning!' },
                secondActivity,
                2,
                expect.arrayContaining([])
              ));

            test('return value should be derived from the second activity', () =>
              expect(useReduceActivities).toHaveLastReturnedWith({ maxText: 'Hello, World!' }));
          });
        });
      });

      describe('when the first activity is removed', () => {
        beforeEach(() => {
          useActivities.mockImplementationOnce(() => [[secondActivity]]);

          renderResult.rerender(<HookApp fn={fn} />);
        });

        describe('should call fn', () => {
          test('3 times in total', () => expect(fn).toHaveBeenCalledTimes(3));
          test('with the second activity only', () =>
            expect(fn).toHaveBeenLastCalledWith(undefined, secondActivity, 0, expect.arrayContaining([])));
        });

        test('return value should be derived from the second activity', () =>
          expect(useReduceActivities).toHaveLastReturnedWith({ maxText: 'Hello, World!' }));
      });

      describe('when the second activity is removed', () => {
        beforeEach(() => {
          useActivities.mockImplementationOnce(() => [[firstActivity]]);

          renderResult.rerender(<HookApp fn={fn} />);
        });

        describe('should not call fn()', () => test('once', () => expect(fn).toHaveBeenCalledTimes(2)));

        test('return value should be derived from the first activity', () =>
          expect(useReduceActivities).toHaveLastReturnedWith({ maxText: 'Aloha!' }));
      });
    });

    describe('when all activities are removed', () => {
      beforeEach(() => {
        useActivities.mockImplementationOnce(() => [[]]);

        renderResult.rerender(<HookApp fn={fn} />);
      });

      test('should not call fn()', () => expect(fn).toHaveBeenCalledTimes(1));
      test('return value should be undefined', () => expect(useReduceActivities).toHaveLastReturnedWith(undefined));
    });

    describe('when activities are unchanged', () => {
      beforeEach(() => {
        useActivities.mockImplementationOnce(() => [[firstActivity]]);

        renderResult.rerender(<HookApp fn={fn} />);
      });

      test('should not call fn()', () => expect(fn).toHaveBeenCalledTimes(1));
      test('return value should be derived from the first activity', () =>
        expect(useReduceActivities).toHaveLastReturnedWith({ maxText: 'Aloha!' }));
    });
  });
});
