import {Request, Response} from 'express'

import {sendMail} from '../services/gmail'
import getRequest from '../utils/requests/getRequest'
import {createRequestPdf} from './pdf'

const mail = {
	ecommerceRequest: async (req: Request, res: Response) => {
		const {requestId} = req.params
		const {to, text}: {to: string[]; text: string} = req.body

		const {request, error} = await getRequest(requestId)
		if (!request) return res.status(404).json({message: error})

		const pdf = await createRequestPdf(request)
		sendMail(
			`${request.cliente.razao_social} criou orçamento`,
			text,
			to,
			'e-commerce@cruzrepresentacoes.com.br',
			{name: 'Pedido.pdf', file: pdf}
		)

		return res.send()
	},

	systemRequest: async (req: Request, res: Response) => {
		const {requestId} = req.params
		const {to, text}: {to: string[]; text: string} = req.body

		const {request, error} = await getRequest(requestId)
		if (!request) return res.status(404).json({message: error})

		const pdf = await createRequestPdf(request)
		sendMail(
			`Pedido: ${request.cliente.razao_social}`,
			text,
			to,
			'sistema@cruzrepresentacoes.com.br',
			{name: 'Pedido.pdf', file: pdf}
		)

		return res.send()
	},

	contact: async (req: Request, res: Response) => {
		const {subject, text}: {subject: string; text: string} = req.body

		const to = ['cruzrepresentacoes@gmail.com']

		sendMail(subject, text, to)

		return res.send()
	},

	general: async (req: Request, res: Response) => {
		const {to, subject, text}: {to: string[]; subject: string; text: string} =
			req.body

		sendMail(subject, text, to)

		return res.send()
	}
}

export default mail
