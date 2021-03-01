import {google} from 'googleapis'

import connect from './connect'

const validFrom =
[
	'sistema@cruzrepresentacoes.com.br',
	'e-commerce@cruzrepresentacoes.com.br',
]

export function send(subject: string, text: string, to: string, from: string = validFrom[0])
{
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`
  const messageParts =
	[
    `From: Cruz Representações <${from}>`,
    `To: ${to}`,
    'Content-Type: text/html charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    text,
  ]
  const message = messageParts.join('\n')
	const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

	async function callback(auth: any)
	{
		const gmail = google.gmail({version: 'v1', auth})

		const res = await gmail.users.messages.send(
		{
			userId: 'me',
			requestBody:
			{
				raw: encodedMessage,
			}
		})

		console.log('[res.data]', res.data)
	}

	connect(callback)
}