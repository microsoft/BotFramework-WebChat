import { checkValidAriaLandmarkRole } from '../hooks/useContainerRole';

describe('useContainerRole hook (accessibility)', () => {
  it('Should accept `undefined` and `null`', async () => {
    expect(checkValidAriaLandmarkRole(undefined)).toEqual('complementary');

    expect(checkValidAriaLandmarkRole(null)).toEqual('complementary');
  });

  it('Should accept landmark role names including `main` and `region`', async () => {
    expect(checkValidAriaLandmarkRole('main')).toEqual('main');

    expect(checkValidAriaLandmarkRole('region')).toEqual('region');
  });

  it('Should throw for invalid WAI-ARIA landmark roles', async () => {
    expect(() => checkValidAriaLandmarkRole('INVALID ROLE')).toThrow(/landmark role/);

    expect(() => checkValidAriaLandmarkRole('alert')).toThrow(/landmark role/);
  });
});
