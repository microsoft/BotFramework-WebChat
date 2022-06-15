import * as React from 'react'
import cx from 'classnames'
import { CustomStylesForCssClass } from '../../../CustomStylesForCssClass'

export type Props = {
	href: string,
	imgSrc: string
	className?: string
	customStyles?: string
}

export const SignatureLink: React.StatelessComponent<Props> = ({
	href,
	imgSrc,
	className,
	customStyles,
}) => {
	return (
		<a className={cx('signature-link', className)} target="_blank" href={href}>
			<img src={imgSrc} alt="Logo" />
			{className && customStyles &&
				<CustomStylesForCssClass cssClass={className} styles={customStyles} />}
		</a>
	)
}


export type SignatureLinkProps = Props
