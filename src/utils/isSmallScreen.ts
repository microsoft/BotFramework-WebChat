const isSmallScreen = () => {
	return window.matchMedia && !window.matchMedia("(min-width: 1024px)").matches
}

export default isSmallScreen
