import {Request, Response} from 'express'
import path from 'path'

import {createPdf} from '../services/pdf'
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
		
		const content =
		[
			{
				image: logoPath,
				width: 150,
				height: 150
			},
			`Cliente: ${request.cliente.nome_fantasia}`
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