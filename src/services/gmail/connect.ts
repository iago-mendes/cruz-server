import fs from 'fs'
import readline from 'readline'
import {google} from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/gmail.send']
const TOKEN_PATH = './token.json'

function connect(callback: Function)
{
	fs.readFile('credentials.json', (err, content) =>
	{
		if (err)
			return console.log('Error loading client secret file:', err)
		authorize(JSON.parse(String(content)))
	})

	function authorize(credentials: any)
	{
		const {client_secret, client_id, redirect_uris} = credentials.installed // check is 'installed' is right
		const oAuth2Client = new google.auth.OAuth2(
			client_id, client_secret, redirect_uris[0]
		)

		fs.readFile(TOKEN_PATH, (err, token) =>
		{
			if (err)
				return getNewToken(oAuth2Client)

			oAuth2Client.setCredentials(JSON.parse(String(token)))
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

		rl.question('Enter the code from that page here: ', (code) =>
		{
			rl.close()
			oAuth2Client.getToken(code, (err: NodeJS.ErrnoException | null, token: any) =>
			{
				if (err)
					return console.error('Error retrieving access token', err)

				oAuth2Client.setCredentials(token)
				fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) =>
				{
					if (err) return console.error(err)
					console.log('Token stored to', TOKEN_PATH)
				})

				callback(oAuth2Client)
			})
		})
	}
}

export default connect