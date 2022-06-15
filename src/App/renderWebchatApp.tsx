import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { AppProps } from './App'
import { ExpandableTemplate } from './templates/ExpandableTemplate'
import { Chat } from '../Chat'

export function renderFullScreenTemplate(props: AppProps) {
	let container = document.createElement('div')
	container.className = 'feedbot'
	
	const wrapper = document.createElement('div')
	wrapper.className = 'feedbot-wrapper'
	
	const logo = document.createElement('div')
	logo.className = 'feedbot-logo'
	
	const logoImg = document.createElement('img')
	logoImg.src = props.theme && props.theme.template && props.theme.template.logoUrl || 'https://cdn.feedyou.ai/webchat/feedyou_logo_red.png'
	logoImg.alt = 'Logo'
	logo.appendChild(logoImg)
	
	wrapper.appendChild(logo)
	
	wrapper.appendChild(container)
	document.body.appendChild(wrapper)
	
	const customScript = props.theme && props.theme.template && props.theme.template.customScript
	if (customScript) {
		const customScriptTag = document.createElement('script')
		customScriptTag.appendChild(document.createTextNode(customScript))
		document.body.appendChild(customScriptTag)
	}
	
	ReactDOM.render(<Chat {...props} />, container)
}

export const renderWebchatApp = (props: AppProps, container: HTMLElement) => {
	if (container) {
		ReactDOM.render(<Chat {...props} />, container)
		return
	}
	
	// FEEDYOU if no container provided, generate default one
	const reactEntryPoint = createReactEntryPoint()
	document.body.appendChild(reactEntryPoint)
	
	switch (props.theme && props.theme.template && props.theme.template.type) {
		case 'full-screen':
			renderFullScreenTemplate(props)
			break
		default:
			ReactDOM.render(<ExpandableTemplate {...props} />, reactEntryPoint)
	}
}

const createReactEntryPoint = () => {
	const reactEntryPoint = document.createElement('div')
	
	if (location.hash.includes('#feedbot-css-reset')) {
		reactEntryPoint.classList.add('feedbot-reset')
	}
	
	return reactEntryPoint
}

