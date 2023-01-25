export const appendScriptToBody = (scriptContent: string) => {
	if (!scriptContent) return
	
	const customScriptTag = document.createElement('script')
	customScriptTag.appendChild(document.createTextNode(scriptContent))
	document.body.appendChild(customScriptTag)
}
