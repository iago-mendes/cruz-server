import { Request, Response } from 'express'

import Client from '../models/Client'
import Seller from '../models/Seller'

export default
{
	logInClient: async (req: Request, res: Response) =>
	{
		let user = {email: '', password: '', id: '', role: ''}

		const client = await Client.findOne({email: req.body.email})
		if (client)
			user = {email: client.email, password: client.senha, id: client._id, role: 'client'}
		else
			return res.status(404).json({ message: "Usuário de cliente não encontrado." })
		
		const isPasswordValid = String(req.body.password) === user.password
		if (!isPasswordValid)
			return res.status(401).json(
			{
				user: null,
				message: "Senha inválida!"
			})
		else
			return res.status(200).send({user: {id: user.id, role: user.role}})
	},

	logInSeller: async (req: Request, res: Response) =>
	{
		let user = {email: '', password: '', id: '', role: ''}
		
		const seller = await Seller.findOne({email: req.body.email})
		if (seller)
			user =
			{
				email: seller.email, password: seller.senha, id: seller._id, role: seller.admin ? 'admin' : 'seller'
			}
		else
			return res.status(404).json({ message: "Usuário de vendedor não encontrado." })
		
		const isPasswordValid = String(req.body.password) === user.password
		if (!isPasswordValid)
			return res.status(401).send(
			{
				user: null,
				message: "Senha inválida!"
			})
		else
			return res.status(200).send({user: {id: user.id, role: user.role}})
	}
}