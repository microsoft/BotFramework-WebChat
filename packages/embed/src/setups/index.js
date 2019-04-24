import setupAries from './aries';
import setupScorpio from './scorpio';
import setupVersion3 from './version3';
import setupVersion4 from './version4';

export default async function setup(...args) {
  const [{ versionFamily } = {}] = args;

  switch (versionFamily) {
    case 'aries':
      return await setupAries(...args);

    case 'scorpio':
      return await setupScorpio(...args);

    case '3':
      return await setupVersion3(...args);

    default:
      return await setupVersion4(...args);
  }
}
