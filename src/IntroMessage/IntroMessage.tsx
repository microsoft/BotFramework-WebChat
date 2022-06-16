import * as React from 'react'

import { logDismissalInDatabase, logTriggerInDatabase } from './apiCalls'
import { introMessageCss } from './introMessageCss'
import { CloseIcon } from './CloseIcon'

export type Props = {
	title: string,
	message: string,
	showAfterMs: number
	onTrigger(): void
}

type State = {
	isVisible: boolean;
}

export class IntroMessage extends React.Component<Props, State> {
	state: State = { isVisible: false }
	showMessage = () => this.setState({ isVisible: true })
	hideMessage = () => this.setState({ isVisible: false })
	
	trigger = () => {
		this.hideMessage()
		logTriggerInDatabase()
		this.props.onTrigger()
	}
	
	dismiss = () => {
		this.hideMessage()
		logDismissalInDatabase()
	}
	
	constructor(props: Props) {
		super(props)
		
		const { showAfterMs } = this.props
		setTimeout(this.showMessage, showAfterMs)
	}
	
	render() {
		const { title, message } = this.props
		const { isVisible } = this.state
		const { trigger, dismiss } = this
		
		if(!title && !message) {
			return null
		}
		
		if (!isVisible) {
			return null
		}
		
		return (
			<div className="intro-message" onClick={trigger}>
				<style>{introMessageCss}</style>
				<div className="intro-message__click-zone" onClick={trigger}>
					{title && <div className="intro-message__title">{title}</div>}
					{message && <div className="intro-message__message">{message}</div>}
				</div>
				
				<div className="intro-message__close-icon" onClick={dismiss}>
					<CloseIcon />
				</div>
			</div>
		)
	}
}

export type IntroMessageProps = Props
