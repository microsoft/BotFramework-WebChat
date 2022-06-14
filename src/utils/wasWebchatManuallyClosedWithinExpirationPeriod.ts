import { getMinutesBetweenTimestamps } from './getMinutesBetweenTimestamps'

export function wasWebchatManuallyClosedWithinExpirationPeriod(expirationIntervalInMinutes: number) {
	if (!localStorage || !localStorage.feedbotClosed) return false
	if (localStorage.feedbotClosed === 'false') return false
	
	const closedTimestamp = Number(localStorage.feedbotClosed)
	const minutesSinceClosed = getMinutesBetweenTimestamps(closedTimestamp, Date.now())
	if (minutesSinceClosed <= expirationIntervalInMinutes) return true
	
	return false
}
