const { userAgent } = navigator;

// not DRY so that list can be alphabetical
const android = /Linux; Android/u.test(userAgent);
const chromium = !/Edge\//u.test(userAgent) && /Chrome\//u.test(userAgent);
const edgeAnaheim = /Edg\//u.test(userAgent);
const edgeUWP = /Edge\//u.test(userAgent);
const firefox = /Firefox\//u.test(userAgent);
const ie11 = /Trident\/7.0/u.test(userAgent);

const chrome = chromium && !edgeAnaheim;
const safari = !(chrome || edgeUWP || ie11 || firefox);

export { android, chrome, chromium, edgeAnaheim, edgeUWP, firefox, ie11, safari };
