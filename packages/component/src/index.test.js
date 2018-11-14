test('setup', () => {});

test('snapshot', () => {
  expect({ hello: 'World!' }).toMatchSnapshot();
});
