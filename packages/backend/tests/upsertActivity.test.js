import createFacility from './createFacility';

test('Upsert activity', async () => {
  const { directLine, store } = await createFacility();

  directLine.activity.next({
    text: 'Hello, World!',
    type: 'message'
  });

  await 0;

  expect(store.getState().activities).toMatchSnapshot();
});
