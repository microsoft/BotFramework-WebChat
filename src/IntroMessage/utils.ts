import { getMinutesBetweenTimestamps } from '../utils/getMinutesBetweenTimestamps'

export const setPopupMessageCloseTimestamp = () => {
	if (!localStorage) {
		return
	}
	 
	localStorage.popupMessageCloseTimestamp = Date.now()
}

export const getPopupMessageCloseTimestamp = () => {
	if (!localStorage || !localStorage.popupMessageCloseTimestamp) {
		return false
	}
	
	return localStorage.popupMessageCloseTimestamp
}

export const wasPopupMessageRecentlyClosed = () => {
	const closeTimestamp = getPopupMessageCloseTimestamp()
	
	if(!closeTimestamp) {
		return false
	}
	
	const minutesSinceClose = getMinutesBetweenTimestamps(Number(closeTimestamp), Date.now())
	const MINUTES_IN_A_DAY = 60 * 24
	
	if (minutesSinceClose <= MINUTES_IN_A_DAY) {
		return true
	}
	
	return false
}