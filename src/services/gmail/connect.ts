import fs from 'fs'
import readline from 'readline'
import {google} from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/gmail.send']
const TOKEN_PATH = 'google/token.json'

function connect(callback: Function)
{
	fs.readFile('google/credentials.json', (err, content) =>
	{
		if (err)
			return console.log('[Error loading client secret file]', err)
		authorize(JSON.parse(String(content)))
	})

	function authorize(credentials: any)
	{
		const {client_secret, client_id, redirect_uri} = credentials.web

		const oAuth2Client = new google.auth.OAuth2(
			client_id, client_secret, redirect_uri
		)

		fs.readFile(TOKEN_PATH, (err, tokens) =>
		{
			if (err)
				return getNewToken(oAuth2Client)

			oAuth2Client.setCredentials(JSON.parse(String(tokens)))
			callback(oAuth2Client)
		})
	}

	function getNewToken(oAuth2Client: any)
	{
		const authUrl = oAuth2Client.generateAuthUrl(
		{
			access_type: 'offline',
			scope: SCOPES,
		})
		console.log('Authorize this app by visiting this url:', authUrl)

		const rl = readline.createInterface(
		{
			input: process.stdin,
			output: process.stdout,
		})

		rl.question('Enter the code from that page here: ', async code =>
		{
			rl.close()

			const {tokens} = await oAuth2Client.getToken(code)

			oAuth2Client.setCredentials(tokens)
			fs.writeFile(TOKEN_PATH, JSON.stringify(tokens), error =>
				{
					if (error)
						return console.error('<< error saving tokens >>', error)
					
					console.log('Token stored to ', TOKEN_PATH)
				})
			
			oAuth2Client.on('tokens', (tokens: any) =>
			{
				fs.writeFile(TOKEN_PATH, JSON.stringify(tokens), error =>
				{
					if (error)
						return console.error('<< error saving tokens >>', error)
					
					console.log('Token stored to ', TOKEN_PATH)
				})
			})

			callback(oAuth2Client)
		})
	}
}

export default connect