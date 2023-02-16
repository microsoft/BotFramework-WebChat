import * as React from 'react'
import { SignatureLink } from './SignatureLink'
import { Theme } from '../../../../themes'
import { SignatureTemplate } from './SignatureTemplate'

type SignatureSchema = Theme['signature']
const FEEDYOU_LOGO_IMG_SRC = 'https://cdn.feedyou.ai/webchat/feedyou_logo_red.png'

export type Props = {
	signature: SignatureSchema
	botId: string
}

const getLinkQueryString = (botId: string) => `?utm_source=webchat&utm_medium=chatbot&utm_campaign=${botId}`

export const Signature: React.StatelessComponent<Props> = ({ signature, botId }) => {
	const { partnerLogoUrl, partnerLinkUrl, partnerLogoStyle,  mode } = signature
	const attachQueryStringToUrl = (url: string) => `${url}${getLinkQueryString(botId)}`
	
	const enhancedFeedyouUrl = attachQueryStringToUrl('https://feedyou.ai')
	const enhancedPartnerUrl = partnerLinkUrl ? attachQueryStringToUrl(partnerLinkUrl) : enhancedFeedyouUrl
	
	const feedyouLink = <SignatureLink
		href={enhancedFeedyouUrl}
		imgSrc={FEEDYOU_LOGO_IMG_SRC}
	/>
	
	const partnerLink = <SignatureLink
		href={enhancedPartnerUrl}
		imgSrc={partnerLogoUrl}
		className="partner-logo"
		customStyles={partnerLogoStyle}
	/>
	
	if(mode === 'none') {
		return null
	}
	
	if (partnerLogoUrl && mode === 'both') {
		return (
			<SignatureTemplate>
				{partnerLink}
				<div style={{ alignSelf: 'center' }}>&</div>
				{feedyouLink}
			</SignatureTemplate>
		)
	}
	
	if (partnerLogoUrl && mode === 'partner') {
		return (
			<SignatureTemplate>
				{partnerLink}
			</SignatureTemplate>
		)
	}
	
	return (
		<SignatureTemplate>
			{feedyouLink}
		</SignatureTemplate>
	)
}

export type SignatureProps = Props
