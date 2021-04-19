import {Request, Response} from 'express'

import {sendMail} from '../services/gmail'
import getRequest from '../utils/requests/getRequest'
import { createRequestPdf } from './pdf'

const mail =
{
	ecommerceRequest: async (req: Request, res: Response) =>
	{
		const {requestId} = req.params
		const {to, text}:{to: string[], text: string} = req.body

		const {request, error} = await getRequest(requestId)
		if (!request)
			return res.status(404).json({message: error})
		
		const pdf = await createRequestPdf(request)
		sendMail('Pedido no E-commerce', text, to, 'e-commerce@cruzrepresentacoes.com.br', {name: 'Pedido.pdf', file: pdf})

		return res.send()
	},

	systemRequest: async (req: Request, res: Response) =>
	{
		const {requestId} = req.params
		const {to, text}:{to: string[], text: string} = req.body

		const {request, error} = await getRequest(requestId)
		if (!request)
			return res.status(404).json({message: error})
		
		const pdf = await createRequestPdf(request)
		sendMail('Pedido no Sistema', text, to, 'sistema@cruzrepresentacoes.com.br', {name: 'Pedido.pdf', file: pdf})

		return res.send()
	},

	general: async (req: Request, res: Response) =>
	{
		const {to, subject, text}:{to: string[], subject: string, text: string} = req.body

		sendMail(subject, text, to)

		return res.send()
	}
}

export default mail