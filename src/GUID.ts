/**
 * @function _guid
 * @description Creates GUID for user based on several different browser variables
 * It will never be RFC4122 compliant but it is robust
 * @returns {Number}
 * @private
 */
export const guid = () => {
    const nav = window.navigator;
    const screen = window.screen;
    let guid: string = '' + nav.mimeTypes.length;
    guid += nav.userAgent.replace(/\D+/g, '');
    guid += nav.plugins.length;
    guid += screen.height || '';
    guid += screen.width || '';
    guid += screen.pixelDepth || '';
    guid += hashCode(window.location.origin);

    return guid;
};

const hashCode = (str: string): any => {
    return str.split('').reduce((prevHash, currVal) =>
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0);
};
