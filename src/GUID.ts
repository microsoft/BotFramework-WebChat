import { v4 as uuid } from 'uuid';

/**
 * @function _guid
 * @description Creates GUID for user based on several different browser variables
 * It will never be RFC4122 compliant but it is robust
 * @returns {Number}
 * @private
 */
export const guid = () => {
    return uuid();
};
