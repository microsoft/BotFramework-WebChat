import hideCursor from './hideCursor';

export default function (driver) {
  return {
    hideCursor: hideCursor.bind(null, driver)
  };
}
