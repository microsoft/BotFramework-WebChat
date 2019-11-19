const { userAgent } = navigator;

// not DRY so that list can be alphabetical
const chrome = !/Edge\//.test(userAgent) && /Chrome\//.test(userAgent);
const edgeUWP = /Edge\//.test(userAgent);
const firefox = /Firefox\//.test(userAgent);
const ie11 = /Trident\/7.0/.test(userAgent);
const safari = !(chrome || edgeUWP || ie11 || firefox);

export { chrome, edgeUWP, firefox, ie11, safari };
