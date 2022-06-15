import * as React from 'react'
import { AppProps } from '../../App'

export type Props = {
	appProps: AppProps
	onClick(): void
	isCollapsed: boolean
}

export const Header: React.StatelessComponent<Props> = ({
	appProps,
	onClick,
	isCollapsed,
}) => {
	const {
		theme: { mainColor },
		header: { extraHtml },
	} = appProps
	
	const backgroundColor = mainColor || '#e51836'
	const title = getTitle(appProps, isCollapsed)
	
	
	return (
		<div className="feedbot-header" onClick={onClick} style={{ backgroundColor }}>
			<span className="feedbot-title">
				 {title}
			</span>
			
			{extraHtml && <span className="feedbot-extra-html">{extraHtml}</span>}
			
			<a
				onClick={e => e.preventDefault()}
				className="feedbot-minimize"
				href="#"
			>_</a>
		</div>
	)
}

const getTitle = (props: AppProps, isCollapsed: boolean) => {
	const { text, textWhenCollapsed } = props.header
	
	const titleWhenExpanded = text || 'Chatbot'
	const titleWhenCollapsed = textWhenCollapsed || titleWhenExpanded
	const titleToShow = isCollapsed ? titleWhenCollapsed : titleWhenExpanded
	
	return titleToShow
}

export type HeaderProps = Props
