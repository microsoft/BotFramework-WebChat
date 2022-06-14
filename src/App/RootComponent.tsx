import * as React from 'react'
import { AppProps } from './App'
import { Chat } from '../Chat'

export const RootComponent: React.StatelessComponent<AppProps> = (props) => {
	return 	(
		<div className="wc-app">
			<Chat {...props} />
		</div>
	);
}
