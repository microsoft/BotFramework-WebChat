import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { AppProps } from './App'
import { ExpandableTemplate } from './templates/ExpandableTemplate'
import { Chat } from '../Chat'
import { FullscreenTemplate } from './templates/FullscreenTemplate'

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
			ReactDOM.render(<FullscreenTemplate {...props} />, reactEntryPoint)
			break
		default:
			ReactDOM.render(
				<ExpandableTemplate {...props} />,
				reactEntryPoint
			)
	}
}

const createReactEntryPoint = () => {
	const reactEntryPoint = document.createElement('div')
	
	if (location.hash.includes('#feedbot-css-reset')) {
		reactEntryPoint.classList.add('feedbot-reset')
	}
	
	return reactEntryPoint
}

