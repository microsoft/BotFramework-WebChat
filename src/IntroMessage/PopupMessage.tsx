import * as React from 'react'
import cx from 'classnames'

import { logDismissalInDatabase, logTriggerInDatabase } from './apiCalls'
import { popupMessageCss } from './popupMessageCss'
import { CloseIcon } from './CloseIcon'
import { setPopupMessageCloseTimestamp, wasPopupMessageRecentlyClosed } from './utils'

export type Props = {
	title: string,
	message: string,
	showAfterMs: number
	onTrigger(): void
}

type State = {
	isVisible: boolean;
	applyInitialFrameCss: boolean;
}

export class PopupMessage extends React.Component<Props, State> {
	state: State = { isVisible: false, applyInitialFrameCss: true }
	showMessage = () => this.setState({ isVisible: true })
	hideMessage = () => this.setState({ isVisible: false })
	
	trigger = () => {
		this.hideMessage()
		logTriggerInDatabase()
		this.props.onTrigger()
	}
	
	dismiss = (event: React.MouseEvent<HTMLDivElement>) => {
		event.stopPropagation()
		this.hideMessage()
		setPopupMessageCloseTimestamp()
		logDismissalInDatabase()
	}
	
	constructor(props: Props) {
		super(props)
		
		const { showAfterMs } = this.props
		setTimeout(this.showMessage, showAfterMs)
	}
	
	componentDidUpdate(prevProps: Props, prevState: State) {
		const didJustBecomeVisible = !prevState.isVisible && this.state.isVisible
		const didJustBecomeInvisible = prevState.isVisible && !this.state.isVisible
		
		if(didJustBecomeVisible) {
			setTimeout(() => this.setState({ applyInitialFrameCss: false }), 0)
		}
		
		if(didJustBecomeInvisible) {
			setTimeout(() => this.setState({ applyInitialFrameCss: true }), 0)
		}
	}
	
	render() {
		const { title, message } = this.props
		const { isVisible, applyInitialFrameCss } = this.state
		const { trigger, dismiss } = this
		
		if(wasPopupMessageRecentlyClosed()) {
			return null
		}
		
		if(!title && !message) {
			return null
		}
		
		if (!isVisible) {
			return null
		}
		
		return (
			<div className={cx({ "popup-message": true, "popup-message--initial": applyInitialFrameCss })} onClick={trigger}>
				<style>{popupMessageCss}</style>
				<div className="popup-message__click-zone" onClick={trigger}>
					{title && <div className="popup-message__title">{title}</div>}
					{message && <div className="popup-message__message">{message}</div>}
				</div>
				
				<div className="popup-message__close-icon" onClick={dismiss}>
					<CloseIcon />
				</div>
			</div>
		)
	}
}

export type PopupMessageProps = Props
