import setupLegacyVersionFamily from './legacy';

export default async function setupVersionFamilyAntares(...args) {
  await setupLegacyVersionFamily(...args, ['webchatantares']);
}
