const { userAgent } = navigator;

// not DRY so that list can be alphabetical
const chrome = !/Edge\//u.test(userAgent) && /Chrome\//u.test(userAgent);
const edgeUWP = /Edge\//u.test(userAgent);
const firefox = /Firefox\//u.test(userAgent);
const ie11 = /Trident\/7.0/u.test(userAgent);
const safari = !(chrome || edgeUWP || ie11 || firefox);

export { chrome, edgeUWP, firefox, ie11, safari };
