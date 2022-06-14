import { ExpandableBarTheme } from './ExpandableBarTheme'
import { FullScreenTheme } from './FullScreenTheme'
import { ExpandableKnobTheme } from './ExpandableKnobTheme'
import { Sidebar } from './SidebarTheme'
import { Theme } from '../App'

export function getStyleForTheme(theme: Theme, remoteConfig: boolean): string {
	switch (theme && theme.template && theme.template.type) {
		case 'expandable-bar':
			return ExpandableBarTheme(theme)
		case 'full-screen':
			return FullScreenTheme(theme)
		case 'expandable-knob':
			return ExpandableKnobTheme(theme)
		case 'sidebar':
			return Sidebar(theme)
	}
	
	// backward compatibility - knob is new default for remote config, old default is bar
	return remoteConfig ? ExpandableKnobTheme(theme) : ExpandableBarTheme(theme)
}
