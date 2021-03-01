import {Request, Response} from 'express'

import {send} from '../services/gmail'

const mail =
{
	ecommerceRequest: async (req: Request, res: Response) =>
	{
		const {to, text}:{to: string, text: string} = req.body

		send('Pedido no E-commerce', text, to, 'e-commerce@cruzrepresentacoes.com.br')

		return res.send()
	}
}

export default mail