const wasUserDirectedToCurrentPageFromWebchat = () => window.location.href.includes('utm_source=Feedbot')
const isPersistActive = (persist: string) => persist === 'user' || persist === 'conversation'

export const shouldRestorePreviousConversation = (persist: string) => {
	return isPersistActive(persist) && wasUserDirectedToCurrentPageFromWebchat()
}
