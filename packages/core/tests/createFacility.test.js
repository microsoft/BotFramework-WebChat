import createFacility from './createFacility';

test('Create facility test', async () => {
  const { store } = await createFacility();

  expect(store.getState()).toHaveProperty('connection.readyState', 1);
});
