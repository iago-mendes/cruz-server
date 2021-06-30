import fs from 'fs'
import readline from 'readline'
import {google} from 'googleapis'
import {OAuth2Client} from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/gmail.send']
const TOKENS_PATH = 'google/tokens.json'
const CREDENTIALS_PATH = 'google/credentials.json'

function connect(callback: (auth: any) => void) {
	fs.readFile(CREDENTIALS_PATH, (err, content) => {
		if (err) return console.log('[Error loading client secret file]', err)
		authorize(JSON.parse(String(content)))
	})

	function authorize(credentials: any) {
		const {client_secret, client_id, redirect_uri} = credentials.web

		const oAuth2Client = new google.auth.OAuth2(
			client_id,
			client_secret,
			redirect_uri
		)

		fs.readFile(TOKENS_PATH, (err, tokens) => {
			if (err) return getNewToken(oAuth2Client)

			oAuth2Client.setCredentials(JSON.parse(String(tokens)))
			callback(oAuth2Client)
		})
	}

	function getNewToken(oAuth2Client: OAuth2Client) {
		const authUrl = oAuth2Client.generateAuthUrl({
			access_type: 'offline',
			scope: SCOPES
		})
		console.log('Authorize this app by visiting this url:', authUrl)

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		})

		rl.question('Enter the code from that page here: ', async code => {
			rl.close()

			oAuth2Client
				.getToken(code)
				.then(({tokens}) => {
					const accessToken = tokens.access_token
					const refreshToken = tokens.refresh_token

					if (!accessToken || !refreshToken)
						return console.error(
							'<< missing tokens >>',
							'\naccess_token: ',
							accessToken,
							'\nrefresh_token: ',
							refreshToken
						)

					oAuth2Client.setCredentials({
						access_token: accessToken,
						refresh_token: refreshToken
					})

					saveTokens(tokens)

					oAuth2Client.on('tokens', (tokens: any) => {
						saveTokens(tokens)
					})

					callback(oAuth2Client)
				})
				.catch(error => {
					console.log('<< error getting token >>', error)
				})
		})
	}

	function saveTokens(newTokens: any) {
		fs.readFile(TOKENS_PATH, (error, oldTokens) => {
			const oldAccessToken = !error
				? JSON.parse(String(oldTokens)).access_token
				: undefined
			const oldRefreshToken = !error
				? JSON.parse(String(oldTokens)).refresh_token
				: undefined

			const tokens = {
				access_token: newTokens.access_token
					? newTokens.access_token
					: oldAccessToken,
				refresh_token: newTokens.refresh_token
					? newTokens.refresh_token
					: oldRefreshToken
			}

			fs.writeFile(TOKENS_PATH, JSON.stringify(tokens), error => {
				if (error) return console.error('<< error saving tokens >>', error)

				console.log('Tokens stored to ', TOKENS_PATH)
			})
		})
	}
}

export default connect
