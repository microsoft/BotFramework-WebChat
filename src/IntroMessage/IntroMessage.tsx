import * as React from 'react'

import { logDismissalInDatabase, logTriggerInDatabase } from './apiCalls'
import { introMessageCss } from './introMessageCss'
import { CloseIcon } from './CloseIcon'

export type Props = {
	title: string,
	userId: string
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
	
	trigger = async(userId: string) => {
		this.hideMessage()
		await logTriggerInDatabase(userId)
		this.props.onTrigger()
	}
	
	dismiss = async(userId: string) => {
		this.hideMessage()
		await logDismissalInDatabase(userId)
	}
	
	constructor(props: Props) {
		super(props)
		
		const { showAfterMs } = this.props
		setTimeout(this.showMessage, showAfterMs)
	}
	
	render() {
		const { title, userId, message } = this.props
		const { isVisible } = this.state
		const { trigger, dismiss } = this
		
		if(!title && !message) {
			return null
		}
		
		if (!isVisible) {
			return null
		}
		
		return (
			<div className="intro-message" onClick={async() => await trigger(userId)}>
				<style>{introMessageCss}</style>
				<div className="intro-message__click-zone" onClick={async() => await trigger(userId)}>
					{title && <div className="intro-message__title">{title}</div>}
					{message && <div className="intro-message__message">{message}</div>}
				</div>
				
				<div className="intro-message__close-icon" onClick={async() => await dismiss(userId)}>
					<CloseIcon />
				</div>
			</div>
		)
	}
}

export type IntroMessageProps = Props
