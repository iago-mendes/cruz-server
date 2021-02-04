import {Request, Response} from 'express'
import bcrypt from 'bcrypt'

import Client from '../models/Client'
import Seller from '../models/Seller'

export default
{
	logInClient: async (req: Request, res: Response) =>
	{
		const {email, password} = req.body
		let user = {email: '', password: '', id: '', role: ''}

		const client = await Client.findOne({email})
		if (client)
			user = {email: client.email, password: client.senha, id: client._id, role: 'client'}
		else
			return res.status(404).json({ message: 'Usuário de cliente não encontrado.' })
		
		const isPasswordValid = await bcrypt.compare(password, client.senha)
		if (!isPasswordValid)
			return res.status(401).json(
			{
				user: null,
				message: 'Senha inválida!'
			})
		else
			return res.status(200).send({user: {id: user.id, role: user.role}})
	},

	logInSeller: async (req: Request, res: Response) =>
	{
		const {email, password} = req.body
		let user = {email: '', password: '', id: '', role: ''}
		
		const seller = await Seller.findOne({email})
		if (seller)
			user =
			{
				email: seller.email, password: seller.senha, id: seller._id, role: seller.admin ? 'admin' : 'seller'
			}
		else
			return res.status(404).json({ message: 'Usuário de vendedor não encontrado.' })
		
		const isPasswordValid = await bcrypt.compare(password, seller.senha)
		if (!isPasswordValid)
			return res.status(401).send(
			{
				user: null,
				message: 'Senha inválida!'
			})
		else
			return res.status(200).send({user: {id: user.id, role: user.role}})
	},

	changePasswordClient: async (req: Request, res: Response) =>
	{
		const {client: clientId} = req.params
		const {senha}:{senha: string} = req.body

		const clientExists = await Client.findById(clientId)
		if (!clientExists)
			return res.status(404).json({message: 'Cliente não encontrado!'})

		if (!senha || senha === '')
			return res.status(400).json({message: 'Senha fornecida é inválida!'})
		
		const password = bcrypt.hashSync(senha, 10)
		if (!password)
			return res.status(500).json({message: 'Algo de errado aconteceu durante a encriptação da senha!'})
		
		await Client.findByIdAndUpdate(clientId, {senha: password})
		return res.send()
	},

	changePasswordSeller: async (req: Request, res: Response) =>
	{
		const {seller: sellerId} = req.params
		const {senha}:{senha: string} = req.body

		const sellerExists = await Seller.findById(sellerId)
		if (!sellerExists)
			return res.status(404).json({message: 'Vendedor não encontrado!'})

		if (!senha || senha === '')
			return res.status(400).json({message: 'Senha fornecida é inválida!'})
		
		const password = bcrypt.hashSync(senha, 10)
		if (!password)
			return res.status(500).json({message: 'Algo de errado aconteceu durante a encriptação da senha!'})
		
		await Seller.findByIdAndUpdate(sellerId, {senha: password})
		return res.send()
	}
}