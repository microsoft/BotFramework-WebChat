import isSmallScreen from '../utils/isSmallScreen'
import {
	wasWebchatManuallyClosedWithinExpirationPeriod,
} from '../utils/wasWebchatManuallyClosedWithinExpirationPeriod'

const DEFAULT_MANUAL_CLOSE_EXPIRY_INTERVAL = 60 * 24

export const handleAutoExpand = (
	autoExpandTimeout: number,
	persist: string,
	disregardManualAutocloseAfterMinutes: number | undefined,
	headerElement: HTMLDivElement,
	wrapperElement: HTMLDivElement

) => {
	if (wasWebchatManuallyClosedWithinExpirationPeriod(disregardManualAutocloseAfterMinutes || DEFAULT_MANUAL_CLOSE_EXPIRY_INTERVAL)) {
		return
	}
	
	if (isSmallScreen()) {
		return
	}
	
	const expandIfNotAlreadyExpanded = () => {
		if(wrapperElement.className.includes("collapsed")) {
			headerElement.click()
		}
	}
	
	
	if (hasUnfinishedSession(persist)) {
		expandIfNotAlreadyExpanded()
		return
	}
	
	if (autoExpandTimeout === 0) {
		// Backwards compatability
		return
	}
	
	scheduleAutoExpansion(autoExpandTimeout, expandIfNotAlreadyExpanded, headerElement)
}

const scheduleAutoExpansion = (timerMs: number, triggerExpand: () => void, headerElement: HTMLDivElement) => {
	const timeoutId = setTimeout(triggerExpand, timerMs)
	
	headerElement.addEventListener('click', () => clearInterval(timeoutId))
}

const hasUnfinishedSession = (persist: string) => {
	const isPersistActive = (persist === 'user' || persist === 'conversation')
	if(!isPersistActive) {
		return false
	}
	
	if (window.location.href.includes('utm_source=Feedbot')) {
		return true
	}
	
	return false
}
