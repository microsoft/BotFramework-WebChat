import createFacility from './createFacility';

test('Incoming activity', async () => {
  const { actions, directLine, store } = await createFacility();

  // Clear out actions
  actions.splice(0);

  directLine.activity.next({
    text: 'Hello, World!',
    type: 'message'
  });

  await 0;

  expect(store.getState().activities).toMatchSnapshot();
  expect(actions).toMatchSnapshot();
});
