import {Request, Response} from 'express'

import RequestModel from '../models/Request'
import {createPdf} from '../services/pdf'

const pdf =
{
	request: async (req: Request, res: Response) =>
	{
		const {requestId} = req.params

		const request = await RequestModel.findById(requestId)
		if (!request)
			return res.status(404).json({message: 'Pedido não encontrado!'})
		
		const content = `Id do cliente: ${request.cliente}`

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