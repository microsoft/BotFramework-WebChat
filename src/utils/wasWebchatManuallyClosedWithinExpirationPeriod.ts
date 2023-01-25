import { getMinutesBetweenTimestamps } from './getMinutesBetweenTimestamps'

const DEFAULT_MANUAL_CLOSE_EXPIRY_INTERVAL = 60 * 24

export function wasWebchatManuallyClosedWithinExpirationPeriod(expirationIntervalInMinutes = DEFAULT_MANUAL_CLOSE_EXPIRY_INTERVAL) {
	if (!localStorage || !localStorage.feedbotClosed) return false
	if (localStorage.feedbotClosed === 'false') return false
	
	const closedTimestamp = Number(localStorage.feedbotClosed)
	const minutesSinceClosed = getMinutesBetweenTimestamps(closedTimestamp, Date.now())
	if (minutesSinceClosed <= expirationIntervalInMinutes) return true
	
	return false
}
