// import syntax: https://github.com/etienne-martin/device-detector-js#typescript-import
import DeviceDetector = require("device-detector-js");

const deviceDetector = new DeviceDetector()

const getDeviceData = () => {
	return deviceDetector.parse(navigator.userAgent)
}

export default getDeviceData
