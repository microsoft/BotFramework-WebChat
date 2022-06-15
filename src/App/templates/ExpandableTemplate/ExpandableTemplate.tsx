import * as React from 'react'
import cx from 'classnames'
import { AppProps } from '../../App'
import { Signature } from './Signature/Signature'
import { Header } from './Header'
import {
	wasWebchatManuallyClosedWithinExpirationPeriod,
} from '../../../utils/wasWebchatManuallyClosedWithinExpirationPeriod'
import isSmallScreen from '../../../utils/isSmallScreen'
import {
	shouldRestorePreviousConversation,
} from '../../../utils/shouldRestorePreviousConversation'
import { Chat } from '../../../Chat'
import { IntroMessage } from '../../../IntroMessage/IntroMessage'

export type Props = AppProps

type State = {
	collapsed: boolean,
	initialized: boolean
}

export class ExpandableTemplate extends React.Component<Props, State> {
	state: State = { collapsed: true, initialized: false }
	expand = () => {
		localStorage.feedbotClosed = false
		this.setState({ collapsed: false, initialized: true })
	}
	collapse = () => {
		localStorage.feedbotClosed = Date.now()
		this.setState({ collapsed: true })
	}
	toggle = () => {
		this.state.collapsed ? this.expand() : this.collapse()
	}
	expandIfUninitialized = () => {
		!this.state.initialized && this.expand()
	}
	
	constructor(props: Props) {
		super(props)
	}
	
	componentDidMount() {
		this.handleAutoexpand()
	}
	
	handleAutoexpand = () => {
		const { manualCloseExpireInMinutes, persist, autoExpandTimeout } = this.props
		
		if (wasWebchatManuallyClosedWithinExpirationPeriod(manualCloseExpireInMinutes)) {
			return
		}
		
		if (isSmallScreen()) {
			return
		}
		
		if (shouldRestorePreviousConversation(persist)) {
			this.expandIfUninitialized()
			return
		}
		
		if (autoExpandTimeout === 0) {
			// Backwards compatability
			return
		}
		
		setTimeout(this.expandIfUninitialized, autoExpandTimeout)
	}
	
	render() {
		const { theme, bot } = this.props
		const { collapsed, initialized } = this.state
		
		const signature = theme && theme.signature
		const showSignature = !!theme && theme.showSignature
		
		
		return (
			<div
				className={cx('feedbot-wrapper', collapsed && 'collapsed')}
				data-html2canvas-ignore=""
			>
				<Header onClick={this.toggle} appProps={this.props} isCollapsed={collapsed} />
				
				<div className="feedbot">
					{initialized && <Chat {...this.props} />}
				</div>
				
				{signature && showSignature &&
					<Signature signature={signature} botId={bot.id} />
				}
				
				{!initialized && (
					<IntroMessage
						title="How can I help you?"
						message="Supportive title for the chatbot intro?"
						showAfterMs={1}
						onTrigger={this.expand}
					/>
				)}
			</div>
		)
	}
}

