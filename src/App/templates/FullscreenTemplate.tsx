import * as React from 'react'
import { AppProps } from '../App'
import { Chat } from '../../Chat'
import { appendScriptToBody } from '../../utils/appendScriptToBody'

export type Props = AppProps

export class FullscreenTemplate extends React.Component<Props, null> {
	constructor(props: Props) {
		super(props)
	}
	
	componentDidMount() {
		this.appendCustomScript()
	}
	
	appendCustomScript = () => {
		const { theme } = this.props
		const customScript = theme && theme.template && theme.template.customScript
		
		if (customScript) {
			appendScriptToBody(customScript)
		}
	}
	
	render() {
		const { theme } = this.props
		const logoSrc = (theme && theme.template && theme.template.logoUrl) || 'https://cdn.feedyou.ai/webchat/feedyou_logo_red.png'
		
		return (
			<div className="feedbot-wrapper" data-html2canvas-ignore="">
				<div className="feedbot-logo">
					<img alt='Logo'  src={logoSrc}/>
				</div>
				
				
				<div className="feedbot">
					<Chat {...this.props} />
				</div>
			</div>
		)
	}
}


