export function generateUserId() {
	var text = ''
	var possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	
	for (var i = 0 ; i < 11 ; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	
	return text
}
