import setupLegacyVersionFamily from './legacy';

export default async function setupVersionFamilyScorpio(...args) {
  await setupLegacyVersionFamily(...args, ['webchatscorpio']);

  return { version: 'scorpio' };
}
