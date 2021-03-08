import {Request, Response} from 'express'
import path from 'path'

import {createPdf} from '../services/pdf'
import baseUrl from '../utils/baseUrl'
import getRequest from '../utils/requests/getRequest'

const pdf =
{
	request: async (req: Request, res: Response) =>
	{
		const {requestId} = req.params

		const {request, error} = await getRequest(requestId)
		if (!request)
			return res.status(404).json({message: error})
		
		const logoPath = path.join(__dirname, '..', '..', 'assets', 'logo.png')
		const companyPathParts = request.representada.imagem.replace(baseUrl, '').split('/').filter(part => part != '')
		const companyPath = path.join(__dirname, '..', '..', ...companyPathParts)
		
		const content =
		[
			{
				columns:
				[
					{
						width: 100,
						image: logoPath
					},
					{
						width: '*',
						alignment: 'center',
						text: [
							{text: 'Cruz representações\n', fontSize: 20, bold: true},
							'contato@cruzrepresentacoes.com.br\n',
							'(38) 99986-6208 (38) 99985-6208 (38) 99166-5923\n',
							`\nID do pedido: ${request.id}`
						]
					},
					{
						width: 100,
						image: companyPath
					}
				],
				columnGap: 10
			}
		]

		const pdf = await createPdf(content)
		return res.contentType('application/pdf').send(pdf)
	},

	general: async (req: Request, res: Response) =>
	{
		const {content} = req.body

		const pdf = await createPdf(content)
		return res.contentType('application/pdf').send(pdf)
	}
}

export default pdf