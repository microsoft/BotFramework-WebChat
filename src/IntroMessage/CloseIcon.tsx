import * as React from 'react'

type Props = { className?: string }

export const CloseIcon: React.StatelessComponent<Props> = ({ className }) => {
	return (
		<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
			<g>
				<circle cx="13" cy="12" r="12" fill="#385B75"/>
				<circle cx="13" cy="12" r="11.25" stroke="#EBF6FF" strokeWidth="1.5"/>
			</g>
			<path d="M9 15.9762L16.9762 8" stroke="#EBF6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
			<path d="M16.9762 15.9762L9 8" stroke="#EBF6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
			<defs>
				<filter id="filter0_d_1732_10023" x="0" y="0" width="26" height="26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
					<feFlood floodOpacity="0" result="BackgroundImageFix"/>
					<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
					<feOffset dy="1"/>
					<feGaussianBlur stdDeviation="0.5"/>
					<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.0435595 0"/>
					<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1732_10023"/>
					<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1732_10023" result="shape"/>
				</filter>
			</defs>
		</svg>
	)
}

