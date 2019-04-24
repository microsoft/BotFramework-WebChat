import setupLegacyVersionFamily from './legacy';

export default async function setupVersionFamilyAries(...args) {
  await setupLegacyVersionFamily(...args, ['webchataries']);

  return { version: 'aries' };
}
