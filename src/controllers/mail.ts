import {Request, Response} from 'express'

import {sendMail} from '../services/gmail'

const mail =
{
	ecommerceRequest: async (req: Request, res: Response) =>
	{
		const {id} = req.params
		const {to, text}:{to: string[], text: string} = req.body

		sendMail('Pedido no E-commerce', text, to, 'e-commerce@cruzrepresentacoes.com.br')

		return res.send()
	},

	systemRequest: async (req: Request, res: Response) =>
	{
		const {to, text}:{to: string[], text: string} = req.body

		sendMail('Pedido no Sistema', text, to, 'sistema@cruzrepresentacoes.com.br')

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