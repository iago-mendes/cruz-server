import {google} from 'googleapis'
import MailComposer from 'nodemailer/lib/mail-composer'

import connect from './connect'

const validFrom =
[
	'sistema@cruzrepresentacoes.com.br',
	'e-commerce@cruzrepresentacoes.com.br',
]

export function sendMail
(subject: string, text: string, to: string[], from: string = validFrom[0], attachment?: {name: string, file: any})
{
	const mail = new MailComposer(
	{
		from: `Cruz Representacoes <${from}>`,
		to: to.join(', '),
		text: text,
		html: text,
		subject: subject,
		textEncoding: 'base64',
		attachments: attachment
		? [{
				filename: attachment.name,
				content: attachment.file,
				encoding: 'base64'
			}]
		: []
	})

	mail.compile().build((error, msg) =>
	{
		if (error)
			console.error('[error compiling mail]', error)
		
		const encodedMessage = Buffer.from(msg)
			.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '')
		
		async function callback(auth: any)
		{
			const gmail = google.gmail({version: 'v1', auth})
	
			await gmail.users.messages.send(
				{
					userId: 'me',
					requestBody:
					{
						raw: encodedMessage,
					},
				})
				.then(res => console.log('[res.data]', res.data))
				.catch(error => console.error('[erro while sending message]', error))
		}
	
		connect(callback)
	})
}